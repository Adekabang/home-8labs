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

**`<PluginName>.xml`** — defines where data lives in config.xml and what fields exist:

```xml
<model>
    <mount>//OPNsense/mynewplugin</mount>
    <description>
        My New Plugin — manages something useful
    </description>
    <items>
        <general>
            <Enabled type="BooleanField">
                <default>1</default>
                <Required>Y</Required>
            </Enabled>
            <ServerAddress type="NetworkField">
                <Required>Y</Required>
                <ValidationMessage>Please enter a valid IP address.</ValidationMessage>
            </ServerAddress>
            <Port type="PortField">
                <default>8080</default>
                <Required>Y</Required>
            </Port>
            <Protocol type="OptionField">
                <Required>Y</Required>
                <default>http</default>
                <OptionValues>
                    <http>HTTP</http>
                    <https>HTTPS</https>
                </OptionValues>
            </Protocol>
        </general>
    </items>
</model>
```

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

`forms/general.xml` defines what the user sees:

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
    protected static $internalServiceClass = 'OPNsense\Mynewplugin\Mynewplugin';
    protected static $internalServiceTemplate = 'OPNsense/Mynewplugin';
    protected static $internalServiceEnabled = 'general.Enabled';
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

## Enhancing an Existing Plugin

When you need to add features to a plugin you didn't write:

1. **Find a similar feature** in the plugin (e.g., copy `Eap` to make `Ldap`)
2. **Copy the structure:** models, controllers, views, forms — every file
3. **Search & replace** names case-sensitively
4. **Add new fields** to model XML + forms XML
5. **Create a config template** for the new section
6. **Add to `+TARGETS`** if generating a new output file
7. **Wire up the menu** if adding a new sub-page
8. **Test locally, submit PR**

### Example: Adding a checkbox to an existing form

**forms/general.xml** — add a field:
```xml
<field>
    <id>mynewplugin.general.NewFeature</id>
    <label>Enable New Feature</label>
    <type>checkbox</type>
    <help>This enables the new experimental feature.</help>
</field>
```

**Model `<PluginName>.xml`** — add the field definition:
```xml
<NewFeature type="BooleanField">
    <default>0</default>
    <Required>N</Required>
</NewFeature>
```

That's it — the UI automagically picks it up. No Volt template changes needed for simple fields.

## Submitting a Pull Request

1. Remove `PLUGIN_DEVEL=YES` from Makefile
2. Bump `PLUGIN_VERSION` appropriately, set `PLUGIN_REVISION=1`
3. Write a meaningful `pkg-descr` (copy from the project's description page)
4. Test on a clean OPNsense install
5. Push to your fork
6. Create PR against `opnsense/plugins`

> **From mimugmail:** "If you are nearly complete, you can also create a PR and ask the guys via GitHub to help. I had no idea how to manage templating either — here's the issue where I asked: https://github.com/opnsense/core/issues/2022"

## Real-World Example: LLDP Plugin

The LLDP daemon plugin (now merged into official plugins) was built from scratch following this guide. Here's a summary of what each part did:

| Part | What it covered |
|------|----------------|
| 1 | Fork plugins repo, copy `collectd` → `lldpd`, rename everything, Makefile, pkg-descr, service control template, setup.sh |
| 2 | Templates (`+TARGETS`, RC file, config), actions file (`actions_lldpd.conf`), Volt template (`general.volt`), models, controllers |
| 3 | Form XML (`general.xml` with checkboxes for LLDP/CDP/SONMP/EDP/FDP protocols), model XML, Jinja2 templating for CLI arguments |
| 4 | Diagnostic tab: register `lldpcli show neighbors` in actions, create API endpoint in `ServiceController`, wire up tab + AJAX call in Volt |

**Discussion archive:** https://github.com/opnsense/plugins/pull/449

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
