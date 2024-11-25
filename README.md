
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
import locator    from '@superhero/locator'

// Locates a configuration manager
const config = locator.lazyload('@superhero/config')

// Define your services
locator.set('serviceA', new class { bootstrap(config) { console.log('Bootstrapping serviceA', config) } })
locator.set('serviceB', new class { bootstrap(config) { console.log('Bootstrapping serviceB', config) } })

// Assign configurations
config.assign({ serviceA: { foo: 'bar' }, serviceB: { baz: 'qux' }})

// Define bootstrap map
const bootstrapMap = { serviceA: true, serviceB: true }

// Bootstrap services
await bootstrap.bootstrap(bootstrapMap, config, locator)
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
  ✔ Bootstrap a simple process with no problem (2.622758ms)
  ✔ Skips services that are defined as "false" in the bootstrap map (0.466346ms)
  ✔ Configurations are passed along to the bootstrap (1.059434ms)

  ▶ Rejects
    ✔ If a bootstrap process throws (1.135434ms)
    ✔ Using an invalid bootstrapMap (0.542784ms)
    ✔ Using an invalid configLocator (0.388452ms)
    ✔ Using an invalid serviceLocator (0.509068ms)
    ✔ Service does not implement "bootstrap" (0.535394ms)
  ✔ Rejects (3.663212ms)
✔ @superhero/bootstrap (19.306015ms)

tests 8
pass 8

----------------------------------------------------------------
file            | line % | branch % | funcs % | uncovered lines
----------------------------------------------------------------
index.js        | 100.00 |    88.00 |  100.00 | 
index.test.js   | 100.00 |   100.00 |   96.00 | 
----------------------------------------------------------------
all files       | 100.00 |    94.00 |   96.97 | 
----------------------------------------------------------------
```

---

## License
This project is licensed under the MIT License.

---

## Contributing
Feel free to submit issues or pull requests for improvements or additional features.
