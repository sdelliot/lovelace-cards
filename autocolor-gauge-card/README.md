# Autocolor Gauge card

A lovelace gauge  card based on https://github.com/ciotlosm/custom-lovelace/tree/master/gauge-card. 

This card differs in three key ways:
1. It is not limited to three severity levels. Rather it enables a variable number of sections.
2. The user can define a start and end color and the color for each segment will be automatically generated.
3. Enables a gauge for non-numeric values (e.g. low, medium, high).


**Options**

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:autocolor-gauge-card`
| title | string | optional | Name to display on card
| measurement | string | optional | If not set, uses the `unit_of_measurement` on the entity or an empty string if `unit_of_measurement` does not exist.
| entity | string | **Required** | `sensor.my_temperature`
| attribute | string | optional | If set, this attribute of the entity is used, instead of its state
| min | number | 0 | Minimum value for graph
| max | number | 100 | Maximum value for graph
| scale | string | '50px' | Base value for graph visual size
| section | object | optional | Section object. See below
| startColor | object | optional | starColor object. Default start color is Green rgb(0, 255, 0). See below for more details.
| endColor | object | optional | endColor object. Default endColor is Red rgb(255, 0, 0) See below for more details.

Section object

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `<section>` | number/null | **Required** | Value from which to start a section. If the value returned from the sensor is a number, then a number value is required. If the sensor returns a string, then no value is required.

startColor and endColor objects

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| r    | number | **Required** | The Red RGB value of your color.
| g    | number | **Required** | The Green RGB value of your color.
| b    | number | **Required** | The Blue RGB value of your color.


**Example**

Using multiple sections
```yaml
- type: custom:autocolor-gauge-card
  title: Pollen Level
  entity: entity: sensor.allergy_index_forecasted_average
  attribute: rating
  section:
    Low: 
    Low/Medium:
    Medium:
    Medium/High:
    High:
```

Using multiple sections alternative
```yaml
- type: custom:autocolor-gauge-card
  title: Pollen Level
  entity: entity: sensor.allergy_index_forecasted_average
  attribute: rating
  section:
    - Low
    - Low/Medium
    - Medium
    - Medium/High
    - High
```

Using non-default colors
```yaml
- type: custom:autocolor-gauge-card
  title: Pollen Level
  entity: entity: sensor.allergy_index_forecasted_average
  attribute: rating
  startColor:
    r: 255
    g: 0
    b: 0
  endColor:
    r: 0
    g: 0
    b: 255
  section:
    - Low
    - Low/Medium
    - Medium
    - Medium/High
    - High
```

Sensor returns a number, with multiple sections
```yaml
- type: custom:autocolor-gauge-card
  title: Gauge Level
  entity: entity: sensor.allergy_index_forecasted_average
  startColor:
    r: 255
    g: 0
    b: 0
  endColor:
    r: 0
    g: 0
    b: 255
  section:
    Low: 0
    Low/Medium: 20
    Medium: 40
    Medium/High: 60
    High: 80
```

Using different min/max
```yaml
- type: custom:autocolor-gauge-card
  title: Gauge Level
  entity: sensor.tempertaure_level_gauge
  min: 0
  max: 24
  section:
    Low: 0
    Medium: 9
    High: 18
```

## Credits
- [@ciotlosm](https://github.com/ciotlosm)
- [@isabellaalstrom](https://github.com/isabellaalstrom)
- Stack Overflow: [1](https://stackoverflow.com/a/30219884) [2]( https://stackoverflow.com/a/5624139)
