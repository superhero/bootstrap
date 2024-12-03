
# Bootstrap

A lightweight module for bootstrapping services with a flexible configuration and service locator design.

## Features

- **Service Bootstrap**: Bootstraps services based on a provided bootstrap map.
- **Configuration Injection**: Supports passing configurations to the services being bootstrapped.
- **Service Locator Integration**: Resolves services in the boostrap map dynamically through a service locator.
- **Error Handling**: Error messages for invalid configurations or bootstrap failures.
- **Skips Disabled Services**: Automatically skips services marked as `false` in the bootstrap map.

---

## Installation

Install via npm:

```bash
npm install @superhero/bootstrap
```

---

## Usage

### Importing the Module
```javascript
import bootstrap from '@superhero/bootstrap'
```

### Example

```javascript
import bootstrap  from '@superhero/bootstrap'
import Config     from '@superhero/config'
import locator    from '@superhero/locator'

// Locates a configuration manager
const config = new Config()

// Define your services
locator.set('serviceA', new class { bootstrap(options) { console.log('Bootstrapping serviceA', options) } })
locator.set('serviceB', new class { bootstrap(options) { console.log('Bootstrapping serviceB', options) } })

// Assign configurations
config.assign({ serviceA: { foo: 'bar' }, serviceB: { baz: 'qux' }})

// Define bootstrap map
const bootstrapMap = { serviceA: true, serviceB: true }

// Bootstrap services
await bootstrap(bootstrapMap, config, locator)
// Output:
// ⇢ Bootstrapping serviceA { "foo": "bar" }
// ⇢ Bootstrapping serviceB { "baz": "qux" }
```

---

## API

### **`bootstrap(bootstrapMap, configLocator, serviceLocator)`**

Bootstraps services based on the provided map, configuration locator, and service locator.

#### Parameters:

- **`bootstrapMap`** *(Object)*: A map of service IDs to service names or `true/false` values. Services marked `false` are skipped. Services marked `tre` use the ID as service name.
- **`configLocator`** *(Function|Object)*: A function or an object with a `find` method for resolving configurations.
- **`serviceLocator`** *(Function|Object)*: A function or an object with a `locate` method for resolving services.

#### Throws:

- **`E_BOOTSTRAP_INVALID_MAP`**: If the `bootstrapMap` is not an object.
- **`E_BOOTSTRAP_INVALID_CONFIG_LOCATOR`**: If the `configLocator` is invalid.
- **`E_BOOTSTRAP_INVALID_SERVICE_LOCATOR`**: If the `serviceLocator` is invalid.
- **`E_BOOTSTRAP`**: For any errors encountered during the bootstrap process.

---

## Tests

This module includes a test suite to verify its functionality. Run the tests with:

```bash
npm test
```

### Test Coverage

```
▶ @superhero/bootstrap
  ✔ Can bootstrap a simple process with no problem (4.395798ms)
  ✔ Skips services that are defined as "false" in the bootstrap map (0.515958ms)
  ✔ Configurations are passed along to the bootstrap (0.709367ms)

  ▶ Rejects
    ✔ Bootstrap process that throws (0.908382ms)
    ✔ Using an invalid bootstrapMap (0.692543ms)
    ✔ Using an invalid configLocator (0.277624ms)
    ✔ Using an invalid serviceLocator (0.257487ms)
    ✔ Service does not implement "bootstrap" (0.24099ms)
  ✔ Rejects (2.81272ms)
✔ @superhero/bootstrap (10.238997ms)

tests 8
suites 2
pass 8

----------------------------------------------------------------
file            | line % | branch % | funcs % | uncovered lines
----------------------------------------------------------------
index.js        | 100.00 |    88.46 |  100.00 | 
index.test.js   | 100.00 |   100.00 |   95.83 | 
----------------------------------------------------------------
all files       | 100.00 |    94.00 |   96.88 | 
----------------------------------------------------------------
```

---

## License
This project is licensed under the MIT License.

---

## Contributing
Feel free to submit issues or pull requests for improvements or additional features.
