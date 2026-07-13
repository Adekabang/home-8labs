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

## Hosting Your Own Plugin Repository

You don't need to submit your plugin to the official `opnsense/plugins` repo. You can manage everything in your own Git repository and distribute it via a custom package repository — just like [mimugmail's community repo](https://www.routerperformance.net/opnsense-repo/).

Three approaches, from simplest to most production-ready:

### Option A: Manual Install (No Repo)

Build and install directly — best for single firewalls or testing.

```bash
# On your build machine
cd your-plugins-repo/net-mgmt/myplugin
make package
# Output: work/pkg/os-myplugin-0.1_1.pkg

# Copy to firewall
scp work/pkg/os-*.pkg root@firewall:/tmp/
ssh root@firewall pkg install /tmp/os-*.pkg
```

**Pros:** Zero infrastructure. **Cons:** Manual updates, no version tracking.

### Option B: Self-Hosted pkg Repository

Create a proper FreeBSD package repository that users add to their OPNsense. This is the standard approach.

**Step 1: Build all your plugin packages**

```bash
# In your plugins repo
cd /path/to/your-plugins
for dir in category/*/; do
    make -C "$dir" package
done

# Collect all built packages
mkdir -p /tmp/repo-packages
find . -name 'os-*.pkg' -exec cp {} /tmp/repo-packages/ \;
```

**Step 2: Generate the repository metadata**

```bash
pkg repo /tmp/repo-packages
```

This creates:
```
/tmp/repo-packages/
├── packagesite.txz     # Package catalog
├── packagesite.yaml    # Human-readable index
├── meta.txz            # Repository metadata
├── meta.conf            # Repo config
├── digests.txz          # Package checksums
├── filesite.txz         # File listing
└── All/                 # All .pkg files
    └── os-myplugin-0.1_1.pkg
```

**Step 3: Host on a web server**

Upload the entire directory to any static file host:

| Host | Example URL |
|------|------------|
| Nginx/Apache on your server | `https://repo.example.com/opnsense/` |
| Cloudflare R2 | `https://pub-xxx.r2.dev/opnsense/` |
| GitHub Releases | Upload as release assets |
| AWS S3 + CloudFront | `https://cdn.example.com/opnsense/` |

**Critical:** The server MUST support HTTP range requests (for partial package downloads).

**Step 4: Create a repo config file**

Create `myrepo.conf`:
```
myrepo: {
  url: "https://repo.example.com/opnsense/${ABI}",
  priority: 5,
  enabled: yes
}
```

- `${ABI}` resolves to the OPNsense ABI string (e.g., `FreeBSD:14:amd64`)
- Place packages at `https://repo.example.com/opnsense/FreeBSD:14:amd64/`

**Step 5: Users install the repo**

```bash
# On the OPNsense firewall
fetch -o /usr/local/etc/pkg/repos/myrepo.conf https://repo.example.com/myrepo.conf
pkg update
```

**Step 6: Install your plugin**

```bash
pkg install os-myplugin
```

Your plugin now appears in the OPNsense UI immediately after install — no reboot needed.

**Keeping your repo updated:**

```bash
# 1. Rebuild packages with new PLUGIN_VERSION
make package

# 2. Copy new .pkg to repo directory, remove old versions
cp work/pkg/os-myplugin-1.0_1.pkg /var/www/repo/FreeBSD:14:amd64/All/
rm /var/www/repo/FreeBSD:14:amd64/All/os-myplugin-0.9_*.pkg

# 3. Regenerate repo metadata
pkg repo /var/www/repo/FreeBSD:14:amd64/
```

> **Real-world example:** [mimugmail's opn-repo](https://github.com/mimugmail/opn-repo) uses this exact pattern. Their repo config: `https://www.routerperformance.net/mimugmail.conf`. Install command: `fetch -o /usr/local/etc/pkg/repos/mimugmail.conf https://www.routerperformance.net/mimugmail.conf`

### Option C: Keep Source in Your Own Git Repo

You don't need to fork `opnsense/plugins` at all. Structure your own repo following the same layout:

```
your-opnsense-plugins/
├── Makefile              # Root Makefile (optional, for batch builds)
├── README.md
├── Mk/
│   └── plugins.mk        # Copy from opnsense/plugins
├── net-mgmt/
│   └── myplugin/
│       ├── Makefile
│       ├── pkg-descr
│       └── src/opnsense/...
├── security/
│   └── myfirewall/
│       ├── Makefile
│       └── src/opnsense/...
└── www/
    └── myproxy/
        ├── Makefile
        └── src/opnsense/...
```

**Build with OPNsense tools:**

The `Mk/plugins.mk` from `opnsense/plugins` includes all the build logic. Copy it to your repo. To build, you still need the OPNsense build environment (FreeBSD 14 VM with `opnsense/tools`).

**CI/CD approach:**

If you set up a FreeBSD build VM, you can automate the entire pipeline:

```yaml
# .github/workflows/build.yml (runs on self-hosted FreeBSD runner)
steps:
  - run: |
      cd your-plugins
      for dir in */*/; do make -C "$dir" package; done
  - run: |
      mkdir -p repo/FreeBSD:14:amd64
      find . -name 'os-*.pkg' -exec cp {} repo/FreeBSD:14:amd64/All/ \;
      pkg repo repo/FreeBSD:14:amd64/
  - uses: actions/upload-artifact@v4
    with:
      path: repo/
```

Then sync the artifacts to your web server or serve directly from GitHub Releases.

> **GitHub Actions on FreeBSD note:** You'll need a self-hosted runner on FreeBSD since GitHub's hosted runners are Linux/macOS/Windows only. Alternatively, build in a FreeBSD VM and upload manually.

### Quick Comparison

| Approach | Setup time | Maintenance | Best for |
|----------|-----------|-------------|----------|
| Manual install | 5 min | Manual every update | 1-2 firewalls, internal tools |
| Self-hosted repo | 30 min | Update + `pkg repo` per release | Team/department deployment |
| Git repo + CI/CD | 2-3 hours | Push → build → deploy | Production, multiple users/customers |
| Official PR | Days (review) | Zero (OPNsense team maintains) | General-purpose plugins |

---

## Walkthrough C: Repository Manager Plugin

> A plugin that lets you manage custom pkg repositories from the OPNsense web UI — no SSH needed. Inspired by the [m.a.x. it professional plugins](https://opnsense.max-it.de/professional-content/freie-videos/). This is a practical project that ties together everything from the guide above.

**What it does:** Instead of manually creating `/usr/local/etc/pkg/repos/*.conf` files and running `pkg update` via SSH, you get a UI panel to add, edit, enable/disable, and remove custom repos.

### Design

This plugin is simpler than LLDP or FreeRADIUS — no daemon to control, no complex config generation. Just:

1. **Form** — name, URL, priority, enabled toggle
2. **Model** — stores repo list in config.xml
3. **Template** — generates `.conf` files from model data
4. **configd action** — runs `pkg update` after changes

```
┌─────────────────────────────────────┐
│  Services → Repo Manager            │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ [+] Add Repository           │   │
│  │                               │   │
│  │  ☑ myrepo    https://...  [✎] │   │
│  │  ☐ testrepo  https://...  [✎] │   │
│  │                               │   │
│  │  [Save]  [Update All Repos]   │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌─ Output ─────────────────────┐   │
│  │ pkg update output here...    │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Step 1: Directory Setup

```bash
mkdir -p src/opnsense/mvc/app/{controllers,models,views}/OPNsense/RepoManager
mkdir -p src/opnsense/mvc/app/controllers/OPNsense/RepoManager/{Api,forms}
mkdir -p src/opnsense/mvc/app/models/OPNsense/RepoManager/{ACL,Menu}
mkdir -p src/opnsense/service/{conf/actions.d,templates/OPNsense/RepoManager}
```

### Step 2: Model

**`models/OPNsense/RepoManager/RepoManager.php`:**
```php
<?php
namespace OPNsense\RepoManager;

use OPNsense\Base\BaseModel;

class RepoManager extends BaseModel
{
}
```

**`models/OPNsense/RepoManager/RepoManager.xml`:**
```xml
<model>
    <mount>//OPNsense/repomanager</mount>
    <description>Custom pkg repository manager</description>
    <version>1.0.0</version>
    <items>
        <repos>
            <repo type="ArrayField">
                <Required>N</Required>
                <enabled type="BooleanField">
                    <Default>1</Default>
                    <Required>Y</Required>
                </enabled>
                <name type="TextField">
                    <Required>Y</Required>
                    <mask>/^[a-zA-Z0-9_-]{1,32}$/u</mask>
                    <ValidationMessage>Only alphanumeric, dash, underscore. Max 32 chars.</ValidationMessage>
                </name>
                <url type="TextField">
                    <Required>Y</Required>
                    <mask>/^https?:\/\/.+/u</mask>
                    <ValidationMessage>Must be a valid HTTP(S) URL.</ValidationMessage>
                </url>
                <priority type="IntegerField">
                    <Default>5</Default>
                    <Required>Y</Required>
                    <MinimumValue>1</MinimumValue>
                    <MaximumValue>20</MaximumValue>
                </priority>
            </repo>
        </repos>
    </items>
</model>
```

This creates a repeatable array of repo entries. Each entry has: name, URL, priority, enabled toggle, and optional authentication credentials.

**Private repo support:** Add a `credentials` container for repos that require authentication:
```xml
<credentials type="ContainerField">
    <Required>N</Required>
    <username type="TextField">
        <Required>N</Required>
    </username>
    <password type="TextField">
        <Required>N</Required>
    </password>
</credentials>
```

The Python script then embeds credentials in the URL if provided:
```python
if creds.find('username') is not None and creds.find('username').text:
    from urllib.parse import quote
    user = creds.find('username').text
    pw = creds.find('password').text if creds.find('password') is not None else ''
    # Embed in URL for basic auth
    url_text = url_text.replace('://', f'://{quote(user)}:{quote(pw)}@')
```

### Step 3: Forms

**`controllers/OPNsense/RepoManager/forms/general.xml`:**
```xml
<form>
    <field>
        <id>repomanager.repos.repo.enabled</id>
        <label>Enabled</label>
        <type>checkbox</type>
        <help>Enable or disable this repository.</help>
    </field>
    <field>
        <id>repomanager.repos.repo.name</id>
        <label>Name</label>
        <type>text</type>
        <help>Short name for the repo (used as the .conf filename).</help>
        <hint>e.g. myrepo</hint>
    </field>
    <field>
        <id>repomanager.repos.repo.url</id>
        <label>URL</label>
        <type>text</type>
        <help>Repository URL. Use ${ABI} for ABI-dependent paths.</help>
        <hint>https://repo.example.com/opnsense/${ABI}</hint>
    </field>
    <field>
        <id>repomanager.repos.repo.priority</id>
        <label>Priority</label>
        <type>text</type>
        <help>Lower number = higher priority. Default is 5.</help>
    </field>
    <field>
        <id>repomanager.repos.repo.credentials.username</id>
        <label>Username (optional)</label>
        <type>text</type>
        <help>For private/authenticated repos. Leave empty for public repos.</help>
    </field>
    <field>
        <id>repomanager.repos.repo.credentials.password</id>
        <label>Password (optional)</label>
        <type>password</type>
        <help>Repo password or access token.</help>
    </field>
</form>
```

### Step 4: Template — Generate .conf Files

Since we need dynamic filenames (one `.conf` per repo), the standard `+TARGETS` approach won't work. We use a **configd Python script** instead that reads config.xml and writes each `.conf` file directly.

**`service/conf/actions.d/actions_repomanager.conf`:**
```
[generate]
command:/usr/local/opnsense/scripts/repomanager/generate_repos.py
parameters:
type:script_output
message:generating repo config files

[update]
command:/usr/sbin/pkg update
parameters:
type:script_output
message:updating pkg repositories
```

**`scripts/repomanager/generate_repos.py`:**
```python
#!/usr/local/bin/python3
"""Generate /usr/local/etc/pkg/repos/*.conf from config.xml"""
import xml.etree.ElementTree as ET
import json
import os

CONFIG = '/conf/config.xml'
REPO_DIR = '/usr/local/etc/pkg/repos'

# Parse config.xml
tree = ET.parse(CONFIG)
root = tree.getroot()

# Find repomanager section
repos = root.findall(".//repomanager/repos/repo")

# Remove old conf files
for f in os.listdir(REPO_DIR):
    if f.endswith('.conf') and f not in ['OPNsense.conf']:
        # Only remove files that match our managed repos
        pass  # Be careful here

# Generate new ones
for repo in repos:
    enabled = repo.find('enabled')
    name = repo.find('name')
    url = repo.find('url')
    priority = repo.find('priority')
    creds = repo.find('credentials')

    if enabled is None or name is None or url is None:
        continue
    if enabled.text != '1':
        continue

    url_text = url.text
    # Embed credentials if provided (for private repos)
    if creds is not None:
        cred_user = creds.find('username')
        cred_pass = creds.find('password')
        if cred_user is not None and cred_user.text:
            from urllib.parse import quote
            user = quote(cred_user.text, safe='')
            pw = quote(cred_pass.text, safe='') if cred_pass is not None and cred_pass.text else ''
            url_text = url_text.replace('://', f'://{user}:{pw}@')

    conf_path = os.path.join(REPO_DIR, f"{name.text}.conf")
    content = f"""{name.text}: {{
  url: "{url_text}",
  priority: {priority.text or '5'},
  enabled: yes
}}
"""
    with open(conf_path, 'w') as f:
        f.write(content)

print(json.dumps({"status": "ok", "generated": len(repos)}))
```

### Step 5: Controllers

**`controllers/OPNsense/RepoManager/IndexController.php`:**
```php
<?php
namespace OPNsense\RepoManager;

class IndexController extends \OPNsense\Base\IndexController
{
    public function indexAction()
    {
        $this->view->generalForm = $this->getForm("general");
        $this->view->pick('OPNsense/RepoManager/index');
    }
}
```

**`controllers/OPNsense/RepoManager/Api/SettingsController.php`:**
```php
<?php
namespace OPNsense\RepoManager\Api;

use \OPNsense\Base\ApiMutableModelControllerBase;

class SettingsController extends ApiMutableModelControllerBase
{
    protected static $internalModelClass = '\OPNsense\RepoManager\RepoManager';
    protected static $internalModelName = 'repomanager';
}
```

**`controllers/OPNsense/RepoManager/Api/ServiceController.php`:**
```php
<?php
namespace OPNsense\RepoManager\Api;

use \OPNsense\Base\ApiControllerBase;
use \OPNsense\Core\Backend;

class ServiceController extends ApiControllerBase
{
    public function generateAction()
    {
        if ($this->request->isPost()) {
            $backend = new Backend();
            $response = $backend->configdRun("repomanager generate");
            return json_decode($response, true) ?: ["status" => "error"];
        }
        return ["status" => "failed"];
    }

    public function updateAction()
    {
        if ($this->request->isPost()) {
            $backend = new Backend();
            $response = $backend->configdRun("repomanager update");
            return ["output" => $response];
        }
        return ["output" => ""];
    }
}
```

### Step 6: View

**`views/OPNsense/RepoManager/index.volt`:**
```html
<script type="text/javascript">
    $( document ).ready(function() {
        // Load repo list
        mapDataToFormUI({'frm_repos':"/api/repomanager/settings/get"});

        // Save to config.xml
        $("#saveAct").click(function(){
            saveFormToEndpoint("/api/repomanager/settings/set",'frm_repos',function(){
                // After save, regenerate .conf files
                ajaxCall(url="/api/repomanager/service/generate", sendData={},callback=function(data,status) {
                    $("#genStatus").html(data['status'] == 'ok' ? '✓ Configs generated' : '✗ Error');
                });
            });
        });

        // Update pkg repos
        $("#updateAct").click(function(){
            $("#updateOutput").html("Running pkg update...");
            ajaxCall(url="/api/repomanager/service/update", sendData={},callback=function(data,status) {
                $("#updateOutput").text(data['output']);
            });
        });
    });
</script>

<div class="col-md-12">
    <button class="btn btn-primary" id="saveAct" type="button">
        <b>{{ lang._('Save') }}</b>
    </button>
    <button class="btn btn-default" id="updateAct" type="button">
        <b>{{ lang._('Update Repositories') }}</b>
    </button>
    <span id="genStatus" style="margin-left:10px;"></span>
</div>

<br/>
{{ partial("layout_partials/base_form",['fields':generalForm,'id':'frm_repos'])}}

<br/>
<div><pre id="updateOutput" style="max-height:300px;overflow-y:scroll;"></pre></div>
```

### Step 7: Menu & ACL

**`models/OPNsense/RepoManager/Menu/Menu.xml`:**
```xml
<menu>
    <System order="60">
        <RepoManager VisibleName="Repo Manager" url="/ui/repomanager/" cssClass="fa fa-database fa-fw"/>
    </System>
</menu>
```

**`models/OPNsense/RepoManager/ACL/ACL.xml`:**
```xml
<acl>
    <page-system-repomanager>
        <name>WebCfg - System: Repo Manager</name>
        <description>Allow access to the custom repository manager</description>
        <patterns>
            <pattern>ui/repomanager/*</pattern>
            <pattern>api/repomanager/*</pattern>
        </patterns>
    </page-system-repomanager>
</acl>
```

### Step 8: Makefile

```makefile
PLUGIN_NAME=        repomanager
PLUGIN_VERSION=     1.0
PLUGIN_REVISION=    1
PLUGIN_COMMENT=     Manage custom pkg repositories from the web UI
PLUGIN_MAINTAINER=  you@example.com
PLUGIN_DEVEL=       YES

.include "../../Mk/plugins.mk"
```

### Result

After installing `os-repomanager`, users get:

- **Add/remove custom repos** from the web UI
- **Enable/disable** repos without deleting them
- **Regenerate** `.conf` files on save
- **Run `pkg update`** with one click and see output inline
- **No SSH needed** for repo management

This is a ~200 line plugin. The core logic is the Python script that reads config.xml and writes `.conf` files — the rest is standard MVC boilerplate.

> **Extension ideas:** Add a "Test connection" button, show last `pkg update` timestamp, support for repo fingerprints/signing keys, batch enable/disable.

---

## Appendix: Hello World Plugin — Full Source Listing

> Complete, build-ready source for a minimal OPNsense plugin. Every file shown in full — copy into your plugins directory, fetch the real `Mk/plugins.mk`, and `make package`. This is the simplest possible plugin with the entire MVC + configd stack working end-to-end.

### File Tree

```
plugins/devel/helloworld/
├── Makefile
├── pkg-descr
└── src/opnsense/
    ├── mvc/app/
    │   ├── controllers/OPNsense/HelloWorld/
    │   │   ├── IndexController.php
    │   │   ├── Api/
    │   │   │   ├── SettingsController.php
    │   │   │   └── ServiceController.php
    │   │   └── forms/general.xml
    │   ├── models/OPNsense/HelloWorld/
    │   │   ├── HelloWorld.php
    │   │   ├── HelloWorld.xml
    │   │   ├── ACL/ACL.xml
    │   │   └── Menu/Menu.xml
    │   └── views/OPNsense/HelloWorld/
    │       └── index.volt
    ├── scripts/helloworld/
    │   └── test_message.py
    └── service/
        ├── conf/actions.d/
        │   └── actions_helloworld.conf
        └── templates/OPNsense/HelloWorld/
            ├── +TARGETS
            └── helloworld.conf
```

### Source Code

**`Makefile`** — plugin metadata:

```makefile
PLUGIN_NAME=        helloworld
PLUGIN_VERSION=     1.0
PLUGIN_REVISION=    1
PLUGIN_COMMENT=     Hello World test plugin — says hello from configd
PLUGIN_MAINTAINER=  dev@example.com
PLUGIN_DEVEL=       YES

.include "../../Mk/plugins.mk"
```

**`pkg-descr`** — package description:

```
A simple Hello World plugin for OPNsense, demonstrating the MVC + configd
architecture. Includes a form, service control, and a configd-powered action
that returns JSON.
```

**`src/opnsense/mvc/app/models/OPNsense/HelloWorld/HelloWorld.php`** — model class:

```php
<?php
namespace OPNsense\HelloWorld;

use OPNsense\Base\BaseModel;

class HelloWorld extends BaseModel
{
}
```

**`src/opnsense/mvc/app/models/OPNsense/HelloWorld/HelloWorld.xml`** — data schema:

```xml
<model>
    <mount>//OPNsense/helloworld</mount>
    <description>Hello World test plugin</description>
    <version>1.0.0</version>
    <items>
        <general>
            <Enabled type="BooleanField">
                <Default>1</Default>
                <Required>Y</Required>
            </Enabled>
            <Greeting type="TextField">
                <Default>Hello from OPNsense!</Default>
                <Required>Y</Required>
            </Greeting>
            <Mood type="OptionField">
                <Default>happy</Default>
                <Required>Y</Required>
                <OptionValues>
                    <happy>😊 Happy</happy>
                    <excited>🚀 Excited</excited>
                    <debugging>🐛 Debugging</debugging>
                </OptionValues>
            </Mood>
        </general>
    </items>
</model>
```

**`src/opnsense/mvc/app/models/OPNsense/HelloWorld/ACL/ACL.xml`** — access control:

```xml
<acl>
    <page-user-helloworld>
        <name>WebCfg - Users: Hello World!</name>
        <description>Allow access to the Hello World module</description>
        <patterns>
            <pattern>ui/helloworld/*</pattern>
            <pattern>api/helloworld/*</pattern>
        </patterns>
    </page-user-helloworld>
</acl>
```

**`src/opnsense/mvc/app/models/OPNsense/HelloWorld/Menu/Menu.xml`** — sidebar entry:

```xml
<menu>
    <User order="99">
        <HelloWorld
            VisibleName="Hello World"
            url="/ui/helloworld/"
            cssClass="fa fa-smile-o fa-fw"
        />
    </User>
</menu>
```

**`src/opnsense/mvc/app/controllers/OPNsense/HelloWorld/IndexController.php`** — page routing:

```php
<?php
namespace OPNsense\HelloWorld;

class IndexController extends \OPNsense\Base\IndexController
{
    public function indexAction()
    {
        $this->view->generalForm = $this->getForm("general");
        $this->view->pick('OPNsense/HelloWorld/index');
    }
}
```

**`src/opnsense/mvc/app/controllers/OPNsense/HelloWorld/forms/general.xml`** — UI form:

```xml
<form>
    <field>
        <id>helloworld.general.Enabled</id>
        <label>Enabled</label>
        <type>checkbox</type>
        <help>Enable the Hello World service.</help>
    </field>
    <field>
        <id>helloworld.general.Greeting</id>
        <label>Greeting Message</label>
        <type>text</type>
        <help>The message to greet with.</help>
    </field>
    <field>
        <id>helloworld.general.Mood</id>
        <label>Mood</label>
        <type>dropdown</type>
        <help>Current developer mood.</help>
    </field>
</form>
```

**`src/opnsense/mvc/app/controllers/OPNsense/HelloWorld/Api/SettingsController.php`** — config get/set:

```php
<?php
namespace OPNsense\HelloWorld\Api;

use \OPNsense\Base\ApiMutableModelControllerBase;

class SettingsController extends ApiMutableModelControllerBase
{
    protected static $internalModelClass = '\OPNsense\HelloWorld\HelloWorld';
    protected static $internalModelName = 'helloworld';
}
```

**`src/opnsense/mvc/app/controllers/OPNsense/HelloWorld/Api/ServiceController.php`** — backend actions:

```php
<?php
namespace OPNsense\HelloWorld\Api;

use \OPNsense\Base\ApiControllerBase;
use \OPNsense\Core\Backend;

class ServiceController extends ApiControllerBase
{
    /**
     * reload template
     */
    public function reloadAction()
    {
        $status = "failed";
        if ($this->request->isPost()) {
            $status = strtolower(trim(
                (new Backend())->configdRun('template reload OPNsense/HelloWorld')
            ));
        }
        return ["status" => $status];
    }

    /**
     * run the test action via configd
     */
    public function testAction()
    {
        if ($this->request->isPost()) {
            $result = json_decode(
                trim((new Backend())->configdRun("helloworld test")),
                true
            );
            if ($result !== null) {
                return $result;
            }
        }
        return ["message" => "unable to run config action"];
    }
}
```

**`src/opnsense/mvc/app/views/OPNsense/HelloWorld/index.volt`** — page template:

```html
<script type="text/javascript">
    $( document ).ready(function() {
        // Load saved data into form
        mapDataToFormUI({'frm_GeneralSettings':"/api/helloworld/settings/get"});

        // Save button
        $("#saveAct").click(function(){
            saveFormToEndpoint("/api/helloworld/settings/set",'frm_GeneralSettings',function(){
                ajaxCall(url="/api/helloworld/service/reload", sendData={},callback=function(data,status) {
                    console.log("Template reload: " + data['status']);
                });
            });
        });

        // Test button — runs configd action and displays JSON result
        $("#testAct").SimpleActionButton({
            onAction: function(data) {
                $("#responseMsg").removeClass("hidden").html(
                    "<strong>" + data['message'] + "</strong><br/>" +
                    "Greeting: " + data['greeting'] + "<br/>" +
                    "Mood: " + data['mood']
                );
            }
        });
    });
</script>

<div class="col-md-12">
    <button class="btn btn-primary" id="saveAct" type="button">
        <b>{{ lang._('Save') }}</b>
    </button>
    <button class="btn btn-default" id="testAct"
        data-endpoint="/api/helloworld/service/test"
        data-label="{{ lang._('Test') }}">
    </button>
</div>

<br/>
<div class="alert alert-info hidden" role="alert" id="responseMsg"></div>

{{ partial("layout_partials/base_form",['fields':generalForm,'id':'frm_GeneralSettings'])}}
```

**`src/opnsense/scripts/helloworld/test_message.py`** — configd worker that reads config and returns JSON:

```python
#!/usr/local/bin/python3
"""Hello World test script — reads config and returns JSON."""
import xml.etree.ElementTree as ET
import json

CONFIG = '/conf/config.xml'

tree = ET.parse(CONFIG)
root = tree.getroot()

# Defaults
enabled = "0"
greeting = "Hello from OPNsense!"
mood = "unknown"

# Read our config from config.xml
node = root.find(".//helloworld/general")
if node is not None:
    e = node.find("Enabled")
    if e is not None and e.text:
        enabled = e.text
    g = node.find("Greeting")
    if g is not None and g.text:
        greeting = g.text
    m = node.find("Mood")
    if m is not None and m.text:
        mood = m.text

result = {
    "message": f"Hello World plugin is {'enabled' if enabled == '1' else 'disabled'}!",
    "greeting": greeting,
    "mood": mood
}

print(json.dumps(result))
```

**`src/opnsense/service/conf/actions.d/actions_helloworld.conf`** — configd action registry:

```
[test]
command:/usr/local/opnsense/scripts/helloworld/test_message.py
parameters:
type:script_output
message:hello world test action
```

**`src/opnsense/service/templates/OPNsense/HelloWorld/+TARGETS`** — template output mapping:

```
helloworld.conf:/usr/local/etc/helloworld/helloworld.conf
```

**`src/opnsense/service/templates/OPNsense/HelloWorld/helloworld.conf`** — Jinja2 config generator:

```jinja2
{% if helpers.exists('OPNsense.helloworld.general.Enabled') and OPNsense.helloworld.general.Enabled == '1' %}
# HelloWorld Configuration
# Generated by OPNsense configd
enabled=1
greeting={{ OPNsense.helloworld.general.Greeting|default("Hello!") }}
mood={{ OPNsense.helloworld.general.Mood|default("happy") }}
{% endif %}
```

### Setup on First Use

```bash
# Clone (or copy these files) into your plugins directory
mkdir -p /usr/plugins/devel/helloworld
# ... copy all files above ...

# One-time: get the real build infrastructure
fetch -o /usr/plugins/Mk/plugins.mk \
  https://raw.githubusercontent.com/opnsense/plugins/master/Mk/plugins.mk

# Build
cd /usr/plugins/devel/helloworld
make package

# Install
pkg install work/pkg/os-helloworld-*.pkg

# Clear caches (first install only)
rm -f /tmp/opnsense_menu_cache.xml
rm -f /tmp/opnsense_acl_cache.json
```

Browse to `https://<firewall>/ui/helloworld/`. You'll see:

- A form with **Enabled** (checkbox), **Greeting** (text), **Mood** (dropdown 😊🚀🐛)
- **Save** button — persists to config.xml, triggers template regeneration
- **Test** button — fires the configd action, displays JSON result inline

### What This Plugin Demonstrates

| Layer | File(s) | What it shows |
|-------|---------|--------------|
| Model | `HelloWorld.php` + `.xml` | Minimal `BaseModel`, mount path, field types (`BooleanField`, `TextField`, `OptionField` with values) |
| View | `index.volt` | Standard OPNsense JS patterns: `mapDataToFormUI`, `saveFormToEndpoint`, `SimpleActionButton` |
| Controller | `IndexController.php` | Page routing, form injection |
| API — Settings | `SettingsController.php` | `ApiMutableModelControllerBase` auto-generates get/set endpoints |
| API — Service | `ServiceController.php` | Manual actions: template reload + configd invocation with JSON parsing |
| Forms | `general.xml` | Field IDs matching model mount path |
| ACL | `ACL.xml` | URL patterns for UI + API, unique ACL key |
| Menu | `Menu.xml` | Sidebar placement, Font Awesome icon |
| configd | `actions_helloworld.conf` | Action type `script_output`, registering Python scripts |
| Script | `test_message.py` | Reading `config.xml` from disk, parsing XML, returning JSON to configd |
| Template | `helloworld.conf` + `+TARGETS` | Jinja2 conditionals, `helpers.exists()`, `|default()` filter, output path mapping |

**From here**, you can adapt this exact skeleton to build your real plugin:
- Add more fields to the form and model
- Replace `test_message.py` with your actual backend logic
- Switch `ApiControllerBase` → `ApiMutableServiceControllerBase` if you need daemon control
- Add more tabs to the volt template for multi-page plugins

## References

- [Official OPNsense Plugin Example Source](https://github.com/opnsense/plugins/tree/master/devel/helloworld)
- [OPNsense Build Tools](https://github.com/opnsense/tools)
- [OPNsense Development Docs](https://docs.opnsense.org/development/examples.html)
- [Volt Template Language](https://docs.phalcon.io/latest/volt/)
- [Jinja2 Template Language](https://jinja.palletsprojects.com/en/stable/)
- [Font Awesome 4 Icons](http://fontawesome.io/icons/)
- [PSR-12 PHP Coding Style](https://www.php-fig.org/psr/psr-12/)
- [@mimugmail's Plugin Development Series](https://www.routerperformance.net/opnsense/plugin-development/)
