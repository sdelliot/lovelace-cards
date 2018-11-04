class AutocolorGaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }

    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);
    if (!cardConfig.scale) cardConfig.scale = "50px";
    if (!cardConfig.min) cardConfig.min = 0;
    if (!cardConfig.max) cardConfig.max = 100;

    const entityParts = this._splitEntityAndAttribute(cardConfig.entity);
    cardConfig.entity = entityParts.entity;
    if (entityParts.attribute) cardConfig.attribute = entityParts.attribute;

    const card = document.createElement('ha-card');
    const shadow = card.attachShadow({ mode: 'open' });
    const content = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = `
      ha-card {
        --base-unit: ${cardConfig.scale};
        height: calc(var(--base-unit)*3);
        position: relative;
      }
      .container{
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2);
        position: absolute;
        top: calc(var(--base-unit)*1.5);
        left: 50%;
        overflow: hidden;
        text-align: center;
        transform: translate(-50%, -50%);
      }
      .gauge-a{
        z-index: 1;
        position: absolute;
        background-color: var(--primary-background-color);
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2);
        top: 0%;
        border-radius:calc(var(--base-unit) * 2.5) calc(var(--base-unit) * 2.5) 0px 0px ;
      }
      .gauge-b{
        z-index: 3;
        position: absolute;
        background-color: var(--paper-card-background-color);
        width: calc(var(--base-unit) * 2.5);
        height: calc(var(--base-unit) * 1.25);
        top: calc(var(--base-unit) * 0.75);
        margin-left: calc(var(--base-unit) * 0.75);
        margin-right: auto;
        border-radius: calc(var(--base-unit) * 2.5) calc(var(--base-unit) * 2.5) 0px 0px ;
      }
      .gauge-c{
        z-index: 2;
        position: absolute;
        background-color: var(--label-badge-yellow);
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2);
        top: calc(var(--base-unit) * 2);
        margin-left: auto;
        margin-right: auto;
        border-radius: 0px 0px calc(var(--base-unit) * 2) calc(var(--base-unit) * 2) ;
        transform-origin: center top;
        transition: all 1.3s ease-in-out;
      }
      .gauge-data{
        z-index: 4;
        color: var(--primary-text-color);
        line-height: calc(var(--base-unit) * 0.3);
        position: absolute;
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2.1);
        top: calc(var(--base-unit) * 1.2);
        margin-left: auto;
        margin-right: auto;
        transition: all 1s ease-out;
      }
      .gauge-data #percent{
        font-size: calc(var(--base-unit) * 0.55);
      }
      .gauge-data #title{
        padding-top: calc(var(--base-unit) * 0.15);
        font-size: calc(var(--base-unit) * 0.30);
      }
    `;
    content.innerHTML = `
      <div class="container">
        <div class="gauge-a"></div>
        <div class="gauge-b"></div>
        <div class="gauge-c" id="gauge"></div>
        <div class="gauge-data"><div id="percent"></div><div id="title"></div></div>
      </div>
    `;
    card.appendChild(content);
    card.appendChild(style);
    card.addEventListener('click', event => {
      this._fire('hass-more-info', { entityId: cardConfig.entity });
    });
    root.appendChild(card);
    this._config = cardConfig;
  }

  _splitEntityAndAttribute(entity) {
      let parts = entity.split('.');
      if (parts.length < 3) {
          return { entity: entity };
      }

      return { attribute: parts.pop(), entity: parts.join('.') };
  }

  _fire(type, detail, options) {
    const node = this.shadowRoot;
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
  }

  _translateTurn(value, config) {
    return 5 * (value - config.min) / (config.max - config.min)
  }

  _translateTurnText(stateValue, sortable, config) {
    for (let i=0; i<sortable.length; i++) {
      if (stateValue === sortable[i][0]) {
        let turn = (i+1)/sortable.length
        return 5 * (turn * 100 - config.min) / (config.max - config.min)
      }
    }
  }
  
  // https://stackoverflow.com/a/30219884
  _GColor(r,g,b) {
    r = (typeof r === 'undefined')?0:r;
    g = (typeof g === 'undefined')?0:g;
    b = (typeof b === 'undefined')?0:b;
    return {r:r, g:g, b:b}
  }
  
  // https://stackoverflow.com/a/30219884
  _createColorRange(color1, color2) {
    let colorList = [], tmpColor;
    for (var i=0; i<255; i++) {
      tmpColor = this._GColor();
      tmpColor.r = color1.r + Math.round((i*(color2.r-color1.r))/255);
      tmpColor.g = color1.g + Math.round((i*(color2.g-color1.g))/255);
      tmpColor.b = color1.b + Math.round((i*(color2.b-color1.b))/255);
      colorList.push(tmpColor);
    }
    return colorList;
  } 

  _getDividedArrayVals(list, splitVal) {
    let div = Math.round(list.length/(splitVal-1))
    let vals = []
    let n = 0
    vals.push(list[0])
    for (var i=0; i<list.length; i++){
      if (n === div){
        vals.push(list[i])
        n = 0;
      }
      n++;
    }
    vals.push(list[list.length-1])
    return vals
  }

  // https://stackoverflow.com/a/5624139
  _componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  // https://stackoverflow.com/a/5624139
  _rgbToHex(r, g, b) {
    return "#" + this._componentToHex(r) + this._componentToHex(g) + this._componentToHex(b);
  }

  /**
   * Get a color based on the numberValue passed in
   * and the colors in the sortable object
   */
  _getColorNumber(numberValue, sortable) {
    let defaultColor = "var(--label-badge-blue)"
    for (let i=0; i<sortable.length; i++) {
      if (i === sortable.length-1) {
        if (numberValue >= sortable[i][1]) {
          let color = this._rgbToHex(sortable[i][2].r,
                      sortable[i][2].g,
                      sortable[i][2].b)
          return color;
        }
        else {
          return defaultColor;
        }
      }
      else {
        if (numberValue >= sortable[i][1] && numberValue < sortable[i+1][1]) {
          let color = this._rgbToHex(sortable[i][2].r,
                      sortable[i][2].g,
                      sortable[i][2].b)
          return color;
        }
      }
    }
  }

  /**
   * Get a color based on the stateValue passed in
   * and the colors in the sortable object
   */
  _getColorText(stateValue, sortable) {
    let defaultColor = "var(--label-badge-blue)"
    for (let i=0; i<sortable.length; i++) {
      if (stateValue === sortable[i][0]) {
        let color = this._rgbToHex(sortable[i][2].r,
                    sortable[i][2].g,
                    sortable[i][2].b)
        return color;
      }
    }
    return defaultColor
  }

  /**
   * Determine if the passed in value is a number
   * or not. Then call the correct _getColor
   * function to return the color.
   */
  _computeColor(stateValue, sortable) {
    let numberValue = Number(stateValue);
    if (isNaN(numberValue) || numberValue == null) {
      let color = this._getColorText(stateValue, sortable)
      return color
    } else {
      let color = this._getColorNumber(numberValue, sortable)
      return color
    }
  }

  /**
   * Create a object that is composed of ["section", "range/null", "colors"]
   * The list is then sorted by the range (assuming it can be). 
   */ 
  _getSortable(stateValue, sections, startColor, endColor) {
    // TODO: Set these somewhere
    let colorRange = this._createColorRange(startColor, endColor)

    let colors = this._getDividedArrayVals(colorRange, Object.keys(sections).length)

    let sortable = [];
    let needSort = true;
    for (let section in sections) {
      if (sections[section] === null || isNaN(Number(section)))
        sortable.push([section, sections[section]]);
      else
        sortable.push([sections[section], section]);
    }
    sortable.sort((a, b) => { return a[1] - b[1] });

    // Adding previously sorted colors
    for (let i=0; i<sortable.length; i++){
      sortable[i].push(colors[i])
    }
    return sortable
  }

  _getEntityStateValue(entity, attribute) {
    if (!attribute) {
      return entity.state;
    }

    return entity.attributes[attribute];
  }

  set hass(hass) {
    const config = this._config;
    const entityState = this._getEntityStateValue(hass.states[config.entity], config.attribute);
    let measurement = "";
    if (config.measurement == null)
      measurement = hass.states[config.entity].attributes.unit_of_measurement;
    else
      measurement = config.measurement;
    
    let startColor = ""
    let endColor = ""
    if (config.startColor == null) {
      // Defaults to Green
      startColor = this._GColor(0, 255, 0);
    }
    else {
      startColor = config.startColor
    }

    if (config.endColor == null) {
      // Defaults to Red
      endColor = this._GColor(255, 0, 0);
    }
    else {
      endColor = config.endColor
    }
    
    const root = this.shadowRoot;
    if (entityState !== this._entityState) {
      root.getElementById("title").textContent = config.title;
      const sortable = this._getSortable(entityState, config.section, startColor, endColor);
      root.getElementById("gauge").style.backgroundColor = this._computeColor(entityState, sortable);

      if (isNaN(Number(entityState))) {
        root.getElementById("percent").textContent = `${entityState}`;
        const turn = this._translateTurnText(entityState, sortable, config) /10;
        root.getElementById("gauge").style.transform = `rotate(${turn}turn)`;
      }
      else {
        root.getElementById("percent").textContent = `${entityState} ${measurement}`;
        const turn = this._translateTurn(entityState, config) / 10;
        root.getElementById("gauge").style.transform = `rotate(${turn}turn)`;
      }
      this._entityState = entityState;
    }
    root.lastChild.hass = hass;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('autocolor-gauge-card', AutocolorGaugeCard);
