---
title: OPNsense Plugin Development
description: Build your own OPNsense plugins from scratch — MVC framework, configd backend, forms, templates, and packaging. Updated for OPNsense 26.x (FreeBSD 14.x).
sidebar:
  order: 3
---

# OPNsense Plugin Development

Build and package OPNsense plugins using the MVC framework (Phalcon/PHP) and the configd backend (Python). This guide walks through creating a plugin from scratch, enhancing existing plugins, and submitting pull requests.

> **Source material:** This guide synthesizes [@mimugmail's plugin development series](https://www.routerperformance.net/opnsense/plugin-development/) (LLDP and FreeRADIUS examples) and the [official OPNsense HelloWorld documentation](https://docs.opnsense.org/development/examples.html). Updated for OPNsense 26.x (FreeBSD 14.x).

## When to Build a Plugin vs. Install a Package

| Approach | Use case | Complexity |
|----------|----------|------------|
| Community Repo | Pre-built software (AdGuard, Grafana, Caddy) | Zero — `pkg install` |
| Build from Ports | Custom software, not in any repo | Medium — `tools.git` |
| **Build a Plugin** | Native OPNsense UI integration, config management, service control | Medium-High |

A plugin gives you: native OPNsense web UI, config.xml integration, service start/stop/reload, and API endpoints accessible from other tools.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                 Frontend (PHP/Phalcon MVC)        │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Models   │  │ Views    │  │ Controllers    │  │
│  │ XML+PHP  │  │ .volt    │  │ Index, Api/*   │  │
│  │ (config  │  │ (HTML    │  │ (routing, JSON │  │
│  │  schema) │  │  render) │  │  API endpoints)│  │
│  └──────────┘  └──────────┘  └───────┬────────┘  │
│                                      │            │
├──────────────────────────────────────┼────────────┤
│                          Unix socket │            │
│  ┌───────────────────────────────────┴─────────┐  │
│  │          Backend (configd / Python)          │  │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────┐ │  │
│  │  │ Actions  │  │ Templates  │  │ Scripts │ │  │
│  │  │ .conf    │  │ Jinja2     │  │ .py/.sh │ │  │
│  │  │ (daemon  │  │ (config    │  │ (custom │ │  │
│  │  │  control)│  │  generation)│  │  logic) │ │  │
│  │  └──────────┘  └────────────┘  └─────────┘ │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Key principles:**

- PHP never calls shell commands directly. All backend work goes through configd actions.
- Backend templates (Jinja2) ≠ frontend templates (Volt). They serve different layers.
- Models define the data schema in config.xml. Forms define the UI. Templates generate service config files.

## Prerequisites

```bash
# On your dev machine:
git clone https://github.com/opnsense/tools          # Build toolkit
git clone https://github.com/<your-user>/plugins     # Your fork of the plugins repo

# On your OPNsense test box: nothing extra needed.
# All dev files live at /usr/local/opnsense/ on the firewall.
```

## Directory Structure

Every plugin follows this canonical layout. The package name is always prefixed `os-` (e.g., `os-helloworld-1.4_2.pkg`).

```
/usr/plugins/<category>/<pluginname>/
├── Makefile
├── pkg-descr
└── src/
    └── opnsense/
        ├── mvc/app/
        │   ├── controllers/OPNsense/<PluginName>/
        │   │   ├── IndexController.php          # Page routing
        │   │   ├── Api/
        │   │   │   ├── SettingsController.php    # get/set config via API
        │   │   │   └── ServiceController.php     # start/stop/reload service
        │   │   └── forms/
        │   │       └── general.xml               # UI field definitions
        │   ├── models/OPNsense/<PluginName>/
        │   │   ├── <PluginName>.php              # Model class (PHP)
        │   │   ├── <PluginName>.xml              # Data schema (config.xml mount)
        │   │   ├── ACL/ACL.xml                   # Access control list
        │   │   └── Menu/Menu.xml                 # Sidebar menu placement
        │   └── views/OPNsense/<PluginName>/
        │       └── index.volt                    # UI template (Volt)
        ├── scripts/<pluginname>/                 # Shell/Python utilities
        └── service/
            ├── conf/actions.d/
            │   └── actions_<pluginname>.conf     # configd command registry
            └── templates/OPNsense/<PluginName>/
                ├── +TARGETS                      # Template output mappings
                └── <configfile>.conf             # Jinja2 config generator
```

**Naming convention:** `OPNsense/<PluginName>` — VendorName/ModuleName. Case matters everywhere. PHP namespaces match directory paths exactly.

## Step-by-Step: New Plugin from Scratch

### 1. Pick a Template Plugin

Don't start from nothing — copy a plugin similar to what you're building:

| If you need... | Copy from... | Why |
|----------------|-------------|-----|
| Single page, some fields | `collectd` | Simplest structure, just one form page |
| Multi-entry CRUD (list + add/edit/delete) | `freeradius`, `siproxd` | Grid-based with user management pattern |
| Diagnostics/dashboard tab | `quagga` (Diagnostics section) | Shows command output in the UI |
| Service with daemon control | `lldpd` | Has service start/stop + config generation |

```bash
cd plugins
# Example: building a simple plugin with one config page
cp -r net-mgmt/collectd net-mgmt/mynewplugin
```

### 2. Search & Replace — The Core Loop

This is where most of the work happens. Replace ALL occurrences, case-sensitive:

| Find | Replace with | Notes |
|------|-------------|-------|
| `collectd` (lowercase) | `mynewplugin` | File/directory names, URLs, config paths |
| `Collectd` (CamelCase) | `Mynewplugin` | Class names, namespace segments |

Files to check:

- `src/opnsense/mvc/app/models/OPNsense/Mynewplugin/*.php`, `*.xml`
- `src/opnsense/mvc/app/controllers/OPNsense/Mynewplugin/*.php`, `Api/*.php`
- `src/opnsense/mvc/app/views/OPNsense/Mynewplugin/*.volt`
- `src/opnsense/service/templates/OPNsense/Mynewplugin/+TARGETS`, `*.conf`
- `src/opnsense/service/conf/actions.d/actions_*.conf`
- `src/opnsense/scripts/OPNsense/Mynewplugin/setup.sh`

> **From mimugmail:** "No knowledge of PHP needed — just search & replace. That's all."

### 3. Makefile

```makefile
PLUGIN_NAME=        mynewplugin
PLUGIN_VERSION=     0.1
PLUGIN_REVISION=    1
PLUGIN_COMMENT=     My New Plugin — does something useful
PLUGIN_MAINTAINER=  you@example.com
PLUGIN_DEVEL=       YES       # Remove before submitting PR

.include "../../Mk/plugins.mk"
```

- `PLUGIN_DEVEL=YES` skips ports dependency checks during development. Remove before PR.
- Final package: `os-mynewplugin-0.1_1.pkg`

### 4. Model — Data Schema

**`<PluginName>.php`** — boilerplate class:

```php
<?php
namespace OPNsense\Mynewplugin;

use OPNsense\Base\BaseModel;

class Mynewplugin extends BaseModel
{
}
```

**`<PluginName>.xml`** — defines where data lives in config.xml and what fields exist.

Each model should include a `<version>` tag (current convention):

```xml
<model>
    <mount>//OPNsense/mynewplugin</mount>
    <description>
        My New Plugin — manages something useful
    </description>
    <version>1.0.0</version>
    <items>
        <general>
            <Enabled type="BooleanField">
                <Default>1</Default>
                <Required>Y</Required>
            </Enabled>
            <ServerAddress type="NetworkField">
                <Required>Y</Required>
                <ValidationMessage>Please enter a valid IP address.</ValidationMessage>
            </ServerAddress>
            <Port type="PortField">
                <Default>8080</Default>
                <Required>Y</Required>
            </Port>
            <Protocol type="OptionField">
                <Required>Y</Required>
                <Default>http</Default>
                <OptionValues>
                    <http>HTTP</http>
                    <https>HTTPS</https>
                </OptionValues>
            </Protocol>
        </general>
    </items>
</model>
```

> **Note:** `<Default>` uses a capital D. `<Required>` can be `Y` or `N`. The `<version>` tag is optional but present in all current plugins.

Available field types from `/usr/local/opnsense/mvc/app/models/OPNsense/Base/FieldTypes/`:

| Field Type | Use for |
|-----------|---------|
| `TextField` | Free-text strings |
| `BooleanField` | Checkboxes (on/off) |
| `IntegerField` | Whole numbers |
| `NetworkField` | IP addresses (v4/v6) |
| `EmailField` | Email addresses (validated) |
| `PortField` | TCP/UDP port numbers |
| `OptionField` | Dropdown select menus |
| `CSVListField` | Comma-separated lists |
| `CertificateField` | Certificate references |
| `InterfaceField` | Network interface references |

### 5. Forms — UI Layout

`forms/general.xml` defines what the user sees. Field `<id>` paths are relative to the model mount point:

| Mount path | Form ID example | Resolves to |
|-----------|----------------|-------------|
| `//OPNsense/mynewplugin` | `mynewplugin.general.Enabled` | `//OPNsense/mynewplugin/general/Enabled` |
| `//OPNsense/lldpd/general` | `general.cdp` | `//OPNsense/lldpd/general/cdp` |

```xml
<form>
    <field>
        <id>mynewplugin.general.Enabled</id>
        <label>Enable My Plugin</label>
        <type>checkbox</type>
        <help>Enable or disable this feature.</help>
    </field>
    <field>
        <id>mynewplugin.general.ServerAddress</id>
        <label>Server Address</label>
        <type>text</type>
        <help>IP address of the target server.</help>
        <hint>e.g. 192.168.1.100</hint>
    </field>
    <field>
        <id>mynewplugin.general.Port</id>
        <label>Port</label>
        <type>text</type>
    </field>
    <field>
        <id>mynewplugin.general.Protocol</id>
        <label>Protocol</label>
        <type>dropdown</type>
    </field>
</form>
```

The `<id>` must match the path in the model: `pluginname.container.field`.

### 6. Controllers

**IndexController.php** — handles page routing:

```php
<?php
namespace OPNsense\Mynewplugin;

class IndexController extends \OPNsense\Base\IndexController
{
    public function indexAction()
    {
        // Pass the form definition to the view
        $this->view->generalForm = $this->getForm("general");
        // Pick the Volt template to render
        $this->view->pick('OPNsense/Mynewplugin/index');
    }
}
```

**Api/SettingsController.php** — REST API for loading/saving config:

```php
<?php
namespace OPNsense\Mynewplugin\Api;

use \OPNsense\Base\ApiMutableModelControllerBase;

class SettingsController extends ApiMutableModelControllerBase
{
    protected static $internalModelClass = 'OPNsense\Mynewplugin\Mynewplugin';
    protected static $internalModelName = 'mynewplugin';
}
```

This automatically provides `get` and `set` API endpoints at:
- `GET/POST /api/mynewplugin/settings/get`
- `POST /api/mynewplugin/settings/set`

Test it (as root): `curl -k -u root:password https://<firewall>/api/mynewplugin/settings/get`

**Api/ServiceController.php** — backend actions (reload, start, stop):

```php
<?php
namespace OPNsense\Mynewplugin\Api;

use \OPNsense\Base\ApiMutableServiceControllerBase;
use \OPNsense\Core\Backend;

class ServiceController extends ApiMutableServiceControllerBase
{
    protected static $internalServiceClass = '\OPNsense\Mynewplugin\Mynewplugin';
    protected static $internalServiceTemplate = 'OPNsense/Mynewplugin';
    protected static $internalServiceEnabled = 'general.Enabled';  // path relative to model mount
    protected static $internalServiceName = 'mynewplugin';

    public function reloadAction()
    {
        if ($this->request->isPost()) {
            $status = strtolower(trim(
                (new Backend())->configdRun('template reload OPNsense/Mynewplugin')
            ));
            return ["status" => $status];
        }
        return ["status" => "failed"];
    }
}
```

### 7. View — Volt Template

`index.volt` renders the page. Start simple:

```html
<script type="text/javascript">
    $( document ).ready(function() {
        // Load saved data into the form
        mapDataToFormUI({'frm_GeneralSettings':"/api/mynewplugin/settings/get"});

        // Wire up the Save button
        $("#saveAct").click(function(){
            saveFormToEndpoint("/api/mynewplugin/settings/set",'frm_GeneralSettings',function(){
                // After save, tell the backend to regenerate config
                ajaxCall(url="/api/mynewplugin/service/reload", sendData={},callback=function(data,status) {});
            });
        });
    });
</script>

<div class="col-md-12">
    <button class="btn btn-primary" id="saveAct" type="button">
        <b>{{ lang._('Save') }}</b>
    </button>
</div>

{{ partial("layout_partials/base_form",['fields':generalForm,'id':'frm_GeneralSettings'])}}
```

**Multi-tab pages** (like LLDP with General + Neighbors tabs):

```html
<ul class="nav nav-tabs" data-tabs="tabs" id="maintabs">
    <li class="active"><a data-toggle="tab" href="#general">{{ lang._('General') }}</a></li>
    <li><a data-toggle="tab" href="#status">{{ lang._('Status') }}</a></li>
</ul>

<div class="tab-content">
    <div id="general" class="tab-pane fade in active">
        <!-- form content here -->
    </div>
    <div id="status" class="tab-pane fade in">
        <pre id="outputArea"></pre>
    </div>
</div>
```

For the status tab, add an API endpoint in ServiceController that calls a configd action and returns output:

```php
public function statusAction()
{
    if ($this->request->isPost()) {
        $response = (new Backend())->configdRun("mynewplugin status");
        return ["response" => $response];
    }
    return ["response" => ""];
}
```

```javascript
ajaxCall(url="/api/mynewplugin/service/status", sendData={}, callback=function(data,status) {
    $("#outputArea").text(data['response']);
});
```

### 8. ACL — Access Control

`ACL/ACL.xml` — who can access the plugin. Without this, only root can see it.

```xml
<acl>
    <page-services-mynewplugin>
        <name>WebCfg - Services: My New Plugin</name>
        <description>Allow access to My New Plugin configuration</description>
        <patterns>
            <pattern>ui/mynewplugin/*</pattern>
            <pattern>api/mynewplugin/*</pattern>
        </patterns>
    </page-services-mynewplugin>
</acl>
```

Clear cache after changes: `rm -f /tmp/opnsense_acl_cache.json`

### 9. Menu — Sidebar Entry

`Menu/Menu.xml` — where it appears in the left sidebar:

```xml
<menu>
    <Services order="50">
        <Mynewplugin
            VisibleName="My New Plugin"
            url="/ui/mynewplugin/"
            cssClass="fa fa-cog fa-fw"
        />
    </Services>
</menu>
```

Available menu sections: `Services`, `VPN`, `Interfaces`, `Firewall`, `System`, `Reporting`, `User`, `Diagnostics`.

Clear cache: `rm -f /tmp/opnsense_menu_cache.xml`

### 10. Backend Templates — Config File Generation

Templates live in `service/templates/OPNsense/<PluginName>/`. They use Jinja2 to read config.xml values and generate service configuration files.

**`+TARGETS`** — maps template source to output file on the filesystem:

```
mynewplugin.conf:/usr/local/etc/mynewplugin/mynewplugin.conf
```

**Template file** (`mynewplugin.conf`):

```jinja2
{% if helpers.exists('OPNsense.mynewplugin.general.Enabled') and OPNsense.mynewplugin.general.Enabled == '1' %}
[server]
address={{ OPNsense.mynewplugin.general.ServerAddress|default("") }}
port={{ OPNsense.mynewplugin.general.Port|default("8080") }}
protocol={{ OPNsense.mynewplugin.general.Protocol }}
{% endif %}
```

**Template helpers:**

| Expression | Meaning |
|-----------|---------|
| `helpers.exists('path')` | Check if config path exists |
| `OPNsense.plugin.field` | Read value from config.xml |
| `|default("fallback")` | Default if empty/undefined |
| `!= ""` | Check for text/string fields |
| `== '1'` | Check for checkbox/BooleanField |
| `{% raw %}...{% endraw %}` | Escape everything inside (pass through literally) |

> **Gotcha:** If your service config contains `}}` or `{%` (common in FreeRADIUS ldap.conf), wrap that section in `{% raw %}...{% endraw %}` or the Jinja2 parser will choke.

### 11. configd Actions — Daemon Control

`service/conf/actions.d/actions_mynewplugin.conf` registers commands that configd can execute:

```
[start]
command:/usr/local/etc/rc.d/mynewplugin start
parameters:
type:script
message:starting mynewplugin daemon

[stop]
command:/usr/local/etc/rc.d/mynewplugin stop
parameters:
type:script

[restart]
command:/usr/local/etc/rc.d/mynewplugin restart
parameters:
type:script

[status]
command:/usr/local/sbin/mynewpluginctl status
parameters:
type:script_output
message:checking mynewplugin status
```

**Action types:**

| Type | Use for | Returns |
|------|---------|---------|
| `script` | RC scripts, service control | OK/Fail |
| `script_output` | Commands that produce output (diagnostics) | stdout as text |
| `stream_output` | Long-running streams | Stream handle |
| `inline` | Template generation (built-in) | Template engine output |

Test from CLI: `configctl mynewplugin status`

### 12. setup.sh — /var Ramdisk Support

OPNsense often runs `/var` as a tmpfs (ramdisk). Directories under `/var/` vanish on reboot. `setup.sh` recreates them:

```bash
#!/bin/sh
mkdir -p /var/run/mynewplugin
chown mynewplugin:mynewplugin /var/run/mynewplugin
```

Place at `src/opnsense/scripts/OPNsense/Mynewplugin/setup.sh`.

### 13. Service RC Template

For plugins that control a daemon, add the rc.d file to your templates. In `+TARGETS`:

```
mynewplugin:/usr/local/etc/rc.d/mynewplugin
mynewplugin.conf:/usr/local/etc/mynewplugin/mynewplugin.conf
```

The `mynewplugin` template generates the FreeBSD rc.d script with proper start/stop commands.

## Build & Test Cycle

### Build the package

```bash
cd plugins/net-mgmt/mynewplugin
make package
# Output: work/pkg/os-mynewplugin-0.1_1.pkg
```

### Install on test OPNsense

```bash
# From the build machine:
scp work/pkg/os-*.pkg root@firewall:/tmp/
ssh root@firewall pkg install /tmp/os-*.pkg

# Or build directly on the OPNsense box:
pkg install git
git clone https://github.com/<user>/plugins
cd plugins/net-mgmt/mynewplugin
make package
pkg install work/pkg/os-*.pkg
```

### Replace an existing plugin

```bash
pkg remove os-mynewplugin
# Then install the new version
```

### Test via API (as root)

```bash
# Read current config
curl -k -u root:password https://<firewall>/api/mynewplugin/settings/get

# Watch configd log
tail -f /var/log/system.log | grep configd
```

## Debugging

| Problem | Check |
|---------|-------|
| Template generation fails | Jinja2 syntax error. Run `configctl template reload OPNsense/Mynewplugin` manually. Check `/var/log/system.log` for traceback. |
| Page 404 after creating controller | URL is `/ui/mynewplugin/` (lowercase). Clear `opnsense_menu_cache.xml`. |
| Form fields empty | Check model mount path + form IDs match. Test API endpoint directly. |
| Save button does nothing | Check browser console for JS errors. Verify API endpoint responds. |
| ACL not showing in user manager | `rm /tmp/opnsense_acl_cache.json` |
| Menu item not appearing | `rm /tmp/opnsense_menu_cache.xml` |
| `make package` fails with cryptic error | Usually an XML syntax issue (mismatched tags, unescaped chars). Check model/form XML. |
| `tag name expected` error | You have `}}` or `{%` in literal config content. Wrap in `{% raw %}...{% endraw %}`. |
| API functions not found | Action methods MUST end with `Action` (e.g., `neighborAction()`, NOT `neighbor()`). |

## Walkthrough A: LLDP Plugin from Scratch

> This 4-part walkthrough follows [@mimugmail's original series](https://www.routerperformance.net/opnsense/plugin-development/). The LLDP daemon plugin was built by copying the `collectd` plugin and adapting it. It was [merged into official plugins](https://github.com/opnsense/plugins/pull/449).

### Part 1: Copy & Rename

**Strategy:** LLDP needs one config page (like `collectd`) and one diagnostics tab to show neighbors (like `quagga` — Diagnostics → Show running-config). Both `collectd` and `lldpd` live in `net-mgmt` in the ports tree, so we stay in that category.

```bash
cd plugins
cp -r net-mgmt/collectd net-mgmt/lldpd
```

Now rename everything, case-sensitive:

```bash
# Files and directories
find net-mgmt/lldpd -name '*collectd*' -exec rename collectd lldpd {} \;
find net-mgmt/lldpd -name '*Collectd*' -exec rename Collectd Lldpd {} \;

# File contents
find net-mgmt/lldpd -type f -exec sed -i '' 's/collectd/lldpd/g' {} \;
find net-mgmt/lldpd -type f -exec sed -i '' 's/Collectd/Lldpd/g' {} \;
```

**Makefile:**
```makefile
PLUGIN_NAME=        lldpd
PLUGIN_VERSION=     0.1
PLUGIN_REVISION=    1
PLUGIN_COMMENT=     LLDP daemon configuration
PLUGIN_MAINTAINER=  you@example.com
PLUGIN_DEVEL=       YES

.include "../../Mk/plugins.mk"
```

**pkg-descr:** Copy the LLDPD project description from its website.

**Service control** (`src/etc/inc/plugins.inc.d/lldpd.inc`): Check the correct PID file location for `lldpd`. Replace all `collectd` references.

**setup.sh** (`src/opnsense/scripts/OPNsense/Lldpd/setup.sh`): Check the ports tree's `pkg-*` files for `/var` directories that `lldpd` creates. Add them so they survive reboot when `/var` is a ramdisk.

### Part 2: Templates, Actions, MVC Files

**`src/opnsense/service/templates/OPNsense/Lldpd/+TARGETS`:**
```
lldpd:/usr/local/etc/rc.d/lldpd
lldpd.conf:/usr/local/etc/lldpd.conf
```

The `lldpd` file controls auto start/stop of the daemon. Remove everything between the first `if` and last `endif`, replace `collectd` with `lldpd`.

**`src/opnsense/service/conf/actions.d/actions_lldpd.conf`:** Rename from `actions_collectd.conf`. This registers the daemon in configd:
```
[start]
command:/usr/local/etc/rc.d/lldpd start
parameters:
type:script
message:starting lldpd

[stop]
command:/usr/local/etc/rc.d/lldpd stop
parameters:
type:script
message:stopping lldpd
```

**MVC files** — search & replace in every file under `src/opnsense/mvc/app/`:

| Directory | Key Files | What to do |
|-----------|-----------|------------|
| `views/OPNsense/Lldpd/` | `general.volt` | UI content — just search & replace |
| `models/OPNsense/Lldpd/` | `General.php`, `General.xml` | Replace `Collectd` → `Lldpd`; model XML done in part 3 |
| `models/OPNsense/Lldpd/ACL/` | `ACL.xml` | Defines URLs for access control |
| `models/OPNsense/Lldpd/Menu/` | `Menu.xml` | Sidebar placement + icon (use [Font Awesome](http://fontawesome.io/icons/)) |
| `controllers/OPNsense/Lldpd/` | `GeneralController.php` | Page definition — search & replace |
| `controllers/OPNsense/Lldpd/Api/` | `*Controller.php` | API + service actions — search & replace |
| `controllers/OPNsense/Lldpd/forms/` | `general.xml` | Field definitions — done in part 3 |

### Part 3: Forms, Model, and Templating

LLDPD works via CLI arguments (e.g., `-c` enables CDP). No traditional `.conf` file — just command-line flags.

**`forms/general.xml`** — checkboxes for each protocol (IDs relative to mount `//OPNsense/lldpd/general`):
```xml
<form>
    <field>
        <id>general.enabled</id>
        <label>Enable LLDP Daemon</label>
        <type>checkbox</type>
        <help>This will activate the LLDPD service.</help>
    </field>
    <field>
        <id>general.cdp</id>
        <label>Enable CDP</label>
        <type>checkbox</type>
        <help>This will activate the Cisco Discovery Protocol.</help>
    </field>
    <field>
        <id>general.sonmp</id>
        <label>Enable SONMP</label>
        <type>checkbox</type>
    </field>
    <field>
        <id>general.edp</id>
        <label>Enable EDP</label>
        <type>checkbox</type>
    </field>
    <field>
        <id>general.fdp</id>
        <label>Enable FDP</label>
        <type>checkbox</type>
    </field>
</form>
```

**Model `General.xml`:**
```xml
<model>
    <mount>//OPNsense/lldpd/general</mount>
    <description>LLDP daemon configuration</description>
    <version>1.0.1</version>
    <items>
        <enabled type="BooleanField">
            <Default>1</Default>
            <Required>Y</Required>
        </enabled>
        <cdp type="BooleanField">
            <Default>0</Default>
            <Required>Y</Required>
        </cdp>
        <sonmp type="BooleanField">
            <Default>0</Default>
            <Required>Y</Required>
        </sonmp>
        <edp type="BooleanField">
            <Default>0</Default>
            <Required>Y</Required>
        </edp>
        <fdp type="BooleanField">
            <Default>0</Default>
            <Required>Y</Required>
        </fdp>
    </items>
</model>
```

> **Note:** Fields sit directly under `<items>` (no `<general>` container) because the mount path itself ends at `general`. Form IDs use `general.cdp` (relative to mount), not `lldpd.general.cdp`.

**Template `lldpd.conf`** — generates CLI arguments (all on one line):
```jinja2
{% if helpers.exists('OPNsense.lldpd.general.cdp') and OPNsense.lldpd.general.cdp == '1' %}-c {% endif %}
{% if helpers.exists('OPNsense.lldpd.general.sonmp') and OPNsense.lldpd.general.sonmp == '1' %}-s {% endif %}
{% if helpers.exists('OPNsense.lldpd.general.edp') and OPNsense.lldpd.general.edp == '1' %}-e {% endif %}
{% if helpers.exists('OPNsense.lldpd.general.fdp') and OPNsense.lldpd.general.fdp == '1' %}-f {% endif %}
```

**Verification:** After saving, check `System > Log Files > General`:
```
Dec 27 13:44:23 OPNsense lldpd[22894]: protocol LLDP enabled
Dec 27 13:44:23 OPNsense lldpd[22894]: protocol CDPv1 enabled
Dec 27 13:44:23 OPNsense lldpd[22894]: protocol CDPv2 enabled
Dec 27 13:44:23 OPNsense lldpd[22894]: protocol SONMP enabled
Dec 27 13:44:23 OPNsense lldpd[22894]: protocol EDP enabled
Dec 27 13:44:23 OPNsense lldpd[22894]: protocol FDP disabled
```

### Part 4: Adding a Diagnostics Tab

Now we want a tab showing `lldpcli show neighbors` output — similar to how the Quagga plugin shows "Show running-config" in a text box.

**Step 1: Register the command** in `actions_lldpd.conf`:
```
[neighbor]
command:/usr/local/sbin/lldpcli show neighbors
parameters:
type:script_output
message:show lldp neighbors
```

**Step 2: Create API endpoint** in `Api/ServiceController.php` (exact code from the [merged plugin](https://github.com/opnsense/plugins/blob/master/net-mgmt/lldpd/src/opnsense/mvc/app/controllers/OPNsense/Lldpd/Api/ServiceController.php)):
```php
namespace OPNsense\Lldpd\Api;

use OPNsense\Base\ApiMutableServiceControllerBase;
use OPNsense\Core\Backend;

class ServiceController extends ApiMutableServiceControllerBase
{
    protected static $internalServiceClass = '\OPNsense\Lldpd\General';
    protected static $internalServiceTemplate = 'OPNsense/Lldpd';
    protected static $internalServiceEnabled = 'enabled';
    protected static $internalServiceName = 'lldpd';

    /**
     * show lldpd neighbors
     * @return array
     */
    public function neighborAction()
    {
        $backend = new Backend();
        $response = $backend->configdRun("lldpd neighbor");
        return array("response" => $response);
    }
}
```

> **Pattern:** Look at existing plugins for reference. This was copied from `plugins/net/quagga/src/opnsense/mvc/app/controllers/OPNsense/Quagga/Api/DiagnosticsController.php` (line 63). Method names MUST end with `Action`.

**Step 3: Wire up the UI** in `general.volt`:

Add Bootstrap tabs:
```html
<ul class="nav nav-tabs" data-tabs="tabs" id="maintabs">
    <li class="active"><a data-toggle="tab" href="#general">{{ lang._('General') }}</a></li>
    <li><a data-toggle="tab" href="#neighbor">{{ lang._('Neighbors') }}</a></li>
</ul>
```

Add the API call:
```javascript
ajaxCall(url="/api/lldpd/service/neighbor", sendData={}, callback=function(data,status) {
    $("#listneighbor").text(data['response']);
});
```

Add the output container:
```html
<div id="neighbor" class="tab-pane fade in">
    <pre id="listneighbor"></pre>
</div>
```

**Step 4: Build and test:**
```bash
git clone https://github.com/<user>/plugins
cd plugins
git checkout lldpd        # if using a branch
cd net-mgmt/lldpd
make package
pkg install work/pkg/os-*.txz
```

**Result:** A plugin with two tabs — General (config) and Neighbors (live output from `lldpcli`). [View the final merged code](https://github.com/opnsense/plugins/blob/master/net-mgmt/lldpd/src/opnsense/mvc/app/views/OPNsense/Lldpd/general.volt).

> **From mimugmail:** "If you're wondering how I figured out the API call pattern — I just looked at the Quagga controller code. And when I was stuck on templating the daemon CLI arguments, I asked in a [GitHub issue](https://github.com/opnsense/core/issues/2022)."

---

## Walkthrough B: Enhancing FreeRADIUS with LDAP Support

> This 4-part walkthrough follows [@mimugmail's original series](https://www.routerperformance.net/opnsense/plugin-development/). The goal: add an LDAP submenu to the existing FreeRADIUS plugin with full UI configuration.

### Part 1: Verify Dependencies & Scaffold the MVC

**First, verify LDAP works with FreeRADIUS on the system:**
```bash
cd /usr/local/etc/raddb/mods-enabled
ln -s ../mods-available/ldap .
service radiusd stop
radiusd -X
```

Output shows the LDAP module loads correctly (just can't connect since no server configured yet):
```
rlm_ldap (ldap): Initialising connection pool
rlm_ldap (ldap): Bind with (anonymous) to ldap://localhost:389 failed: Can't contact LDAP server
```

Good — all FreeRADIUS LDAP dependencies are met.

**Add the menu entry** in `models/OPNsense/Freeradius/Menu/Menu.xml`:
```xml
<LDAP url="/ui/freeradius/ldap/index" order="50"/>
```

**Scaffold the Model:** Copy `Eap.xml` and `Eap.php` → `Ldap.xml` and `Ldap.php`. Replace `EAP` → `LDAP`, `eap` → `ldap`, `Eap` → `Ldap` (case-sensitive).

**Scaffold the Controllers:**
- Copy `controllers/OPNsense/Freeradius/EapController.php` → `LdapController.php`
- Copy `controllers/OPNsense/Freeradius/Api/EapController.php` → `Api/LdapController.php`
- Replace `Eap` → `Ldap` everywhere

**Scaffold the View:** Copy `views/OPNsense/Freeradius/eap.volt` → `ldap.volt`. Search & replace.

Now you have the (M)odel, (C)ontroller, and (V)iew skeleton.

> **From mimugmail:** "No PHP knowledge needed. Just search & replace FTW!"

### Part 2: Define Fields (Forms + Model)

Looking at `/usr/local/etc/raddb/mods-enabled/ldap`, the interesting config values are:
`server`, `port`, `identity`, `password`, `base_dn`.

Since the `server` config supports both `ldap://` and `ldaps://` URIs, we can combine protocol+host into a dropdown + text field instead of a separate port field.

**`forms/ldap.xml`:**
```xml
<form>
    <field>
        <id>freeradius.ldap.protocol</id>
        <label>Protocol</label>
        <type>dropdown</type>
    </field>
    <field>
        <id>freeradius.ldap.server</id>
        <label>Server</label>
        <type>text</type>
        <help>IP address or hostname of LDAP server</help>
    </field>
    <field>
        <id>freeradius.ldap.identity</id>
        <label>Identity</label>
        <type>text</type>
        <help>Bind DN for LDAP connection</help>
    </field>
    <field>
        <id>freeradius.ldap.password</id>
        <label>Password</label>
        <type>password</type>
    </field>
    <field>
        <id>freeradius.ldap.base_dn</id>
        <label>Base DN</label>
        <type>text</type>
        <help>Search base for user lookups</help>
    </field>
</form>
```

**Model `Ldap.xml`:**
```xml
<model>
    <mount>//OPNsense/freeradius/ldap</mount>
    <description>FreeRADIUS LDAP configuration</description>
    <version>1.0.0</version>
    <items>
        <protocol type="OptionField">
            <Default>ldap</Default>
            <Required>Y</Required>
            <OptionValues>
                <ldap>LDAP</ldap>
                <ldaps>LDAPS</ldaps>
            </OptionValues>
        </protocol>
        <server type="TextField">
            <Required>Y</Required>
        </server>
        <identity type="TextField">
            <Required>Y</Required>
        </identity>
        <password type="TextField">
            <Required>Y</Required>
        </password>
        <base_dn type="TextField">
            <Required>Y</Required>
        </base_dn>
    </items>
</model>
```

### Part 3: Configuration Template

The LDAP module config at `/usr/local/etc/raddb/mods-enabled/ldap` needs to be generated from the UI values. Copy the existing `mods-enabled/ldap` content into `templates/OPNsense/Freeradius/mods-enabled-ldap`.

**`+TARGETS`:**
```
mods-enabled-ldap:/usr/local/etc/raddb/mods-enabled/ldap
```

**Template logic** — use Jinja2 conditionals to only output values when set:
```jinja2
{% if helpers.exists('OPNsense.freeradius.general.enabled') and OPNsense.freeradius.general.enabled == '1' %}
{%   if helpers.exists('OPNsense.freeradius.general.ldap_enabled') and OPNsense.freeradius.general.ldap_enabled == '1' %}

{% if helpers.exists('OPNsense.freeradius.ldap.server') and OPNsense.freeradius.ldap.server != "" %}
server = '{{ OPNsense.freeradius.ldap.protocol }}://{{ OPNsense.freeradius.ldap.server }}'
{% endif %}

{% if helpers.exists('OPNsense.freeradius.ldap.identity') and OPNsense.freeradius.ldap.identity != "" %}
identity = '{{ OPNsense.freeradius.ldap.identity }}'
{% endif %}

{% if helpers.exists('OPNsense.freeradius.ldap.password') and OPNsense.freeradius.ldap.password != "" %}
password = {{ OPNsense.freeradius.ldap.password }}
{% endif %}

{% if helpers.exists('OPNsense.freeradius.ldap.base_dn') and OPNsense.freeradius.ldap.base_dn != "" %}
base_dn = '{{ OPNsense.freeradius.ldap.base_dn }}'
{% endif %}

{%   endif %}
{% endif %}
```

**Template pattern:**
- `!= ""` for text fields → only output when user filled something in
- `== '1'` for checkboxes → only output when enabled
- The outer `if` checks FreeRADIUS is enabled; inner `if` checks LDAP sub-feature is enabled

### Part 4: Add Enable Checkbox, Build, and Debug

We need a checkbox in the General tab to toggle LDAP on/off, so LDAP config is only generated when the user explicitly enables it.

**Add field to `forms/general.xml`** (third field):
```xml
<field>
    <id>freeradius.general.ldap_enabled</id>
    <label>Enable LDAP</label>
    <type>checkbox</type>
    <help>This allows you to bind to an external LDAP server. Use the LDAP submenu for configuration.</help>
</field>
```

**Add to model `General.xml`** (third field):
```xml
<ldap_enabled type="BooleanField">
    <Default>0</Default>
    <Required>N</Required>
</ldap_enabled>
```

No Volt template changes needed for a simple checkbox.

**Build and install:**
```bash
pkg install git
git clone https://github.com/mimugmail/plugins
cd plugins
git checkout frldap                    # if using a branch
cd net/freeradius
make package
pkg install work/pkg/os-*.txz
```

> If the stable `os-freeradius` package is already installed, remove it first: `pkg remove os-freeradius`

**Common error during `make package`:**
```
OPNsense configd.py: Inline action failed with OPNsense/Freeradius
OPNsense/Freeradius/mods-enabled-ldap tag name expected
```

**Cause:** The original `mods-enabled/ldap` contains `}}` in its config:
```
user {
    base_dn = "${..base_dn}"
    filter = "(uid=%{%{Stripped-User-Name}:-%{User-Name}})"
}
```

The `}}` is interpreted as a Jinja2 closing tag. **Fix:** Wrap the entire default config content in `{% raw %}...{% endraw %}` — but keep the conditional `if/endif` blocks outside the raw block:
```jinja2
{% if helpers.exists('OPNsense.freeradius.general.ldap_enabled') and OPNsense.freeradius.general.ldap_enabled == '1' %}
{% raw %}
ldap {
    server = ...
    # ... all the standard FreeRADIUS LDAP module config ...
}
{% endraw %}
{% endif %}
```

After this fix, `make package` succeeds and the plugin installs cleanly.

**Final result:** FreeRADIUS now has a working LDAP submenu with protocol, server, identity, password, and base_dn fields. All values are persisted to config.xml and templated into `/usr/local/etc/raddb/mods-enabled/ldap` on save.

---

## Submitting a Pull Request

1. Remove `PLUGIN_DEVEL=YES` from Makefile
2. Bump `PLUGIN_VERSION` appropriately, set `PLUGIN_REVISION=1`
3. Write a meaningful `pkg-descr` (copy from the project's description page)
4. Test on a clean OPNsense install
5. Push to your fork
6. Create PR against `opnsense/plugins`

> **From mimugmail:** "If you are nearly complete, you can also create a PR and ask the guys via GitHub to help. I had no idea how to manage templating either — here's the issue where I asked: https://github.com/opnsense/core/issues/2022. As you can see, it doesn't have to be perfect from the beginning."

## Multi-language Support

OPNsense uses gettext for translations. Wrap user-visible strings:

In **Volt templates:**
```html
{{ lang._('Save') }}
{{ lang._('Enable this feature') }}
```

In **PHP:**
```php
<?= gettext('Configuration saved') ?>
```

In **PHP with variables:**
```php
<?= sprintf(gettext('Restarted %s processes'), $count) ?>
```

## Package Naming & Versioning

All OPNsense plugins follow the `os-` prefix convention. The versioning scheme:

```
os-helloworld-1.4_2.pkg
│             │ │
│             │ └─ PLUGIN_REVISION (packaging revision)
│             └─── PLUGIN_VERSION (plugin version)
└───────────────── Always os- prefixed (handled by build system)
```

- `PLUGIN_VERSION`: Your plugin version. Semantic versioning encouraged.
- `PLUGIN_REVISION`: Bump when the packaging changes but code is the same. Reset to 1 on version bump.

## References

- [Official OPNsense Plugin Example Source](https://github.com/opnsense/plugins/tree/master/devel/helloworld)
- [OPNsense Build Tools](https://github.com/opnsense/tools)
- [OPNsense Development Docs](https://docs.opnsense.org/development/examples.html)
- [Volt Template Language](https://docs.phalcon.io/latest/volt/)
- [Jinja2 Template Language](https://jinja.palletsprojects.com/en/stable/)
- [Font Awesome 4 Icons](http://fontawesome.io/icons/)
- [PSR-12 PHP Coding Style](https://www.php-fig.org/psr/psr-12/)
- [@mimugmail's Plugin Development Series](https://www.routerperformance.net/opnsense/plugin-development/)
