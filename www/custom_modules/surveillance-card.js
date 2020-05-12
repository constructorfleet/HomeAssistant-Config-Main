import {
  LitElement, html
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';

import { repeat } from 'https://unpkg.com/lit-html@0.10.2/lib/repeat.js?module';

class SurveillanceCard extends LitElement {
  /* eslint-disable indent,object-curly-newline */
  _render({ imageSources, currentCamera, lastMotion, updateInterval }) {
    const accessToken = currentCamera && this._hass.states[currentCamera].attributes.access_token;
    const template = html`
    <style>
      .container {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: stretch;
        position: absolute;
        background: #000;
      }

      .thumbs {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: inherit
      }

      .thumb > img {
        width: 100%;
        height: auto;
        border: 1px solid var(--primary-color);
      }

      .thumb {
        width: calc(100% - 9px);
        padding: 2px 4px;
        position: relative;
      }

      .thumb.motion > img {
        border-color: var(--accent-color);
      }

      img {
        display: block;
      }

      .mainImage {
        flex: ${this.cameras.length-1};
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .mainImage > img {
        display: inline-block;
        max-width: 100%;
        max-height: 100%;
      }

      .loading {
        color: #FFF;
        text-align: center;
        font-size: 1.2rem;
        margin-top: 3rem;
      }
    </style>
    <div class="container">
      <div class="thumbs">
        ${imageSources ? repeat(this.cameras, (camera) => {
          const thumbClass = lastMotion && lastMotion === camera.motion ? 'thumb motion' : 'thumb';
          const source = this.imageSources[camera.entity];
          return html`
            <div class$="${thumbClass}" on-click="${() => { this.currentCamera = camera.entity; }}">
              <img src="${source || ''}" />
            </div>
          `;
        }) : html`<div class="loading">Loading Cameras...</div>`}
      </div>
      <div class="mainImage">
        <img src$="${currentCamera ? `/api/camera_proxy_stream/${currentCamera}?token=${accessToken}&interval=${updateInterval}` : ''}" />
      </div>
    </div>
    `;

    return template;
  }
  /* eslint-enable indent,object-curly-newline */

  static get properties() {
    return {
      _hass: Object,
      cameras: Array,
      currentCamera: String,
      imageSources: Object,
      lastMotion: String,
      thumbInterval: Number,
      updateInterval: Number
    };
  }

  setConfig(config) {
    console.log('Config', config);
    console.log('Config.Cameras', config.cameras);
    this.cameras = config.cameras.map(c => ({
      entity: c.entity,
      motion: c.motion_entity
    }));
    this.currentCamera = this.cameras[0].entity;
    this.thumbInterval = (config.thumb_interval || 10) * 1000;
    this.updateInterval = config.update_interval || 1;
    this.focusMotion = config.focus_motion !== false;
  }

  set hass(hass) {
    this._hass = hass;

    for (const cam of this.cameras) {
      const { motion } = cam;
      if ((motion in hass.states) && (hass.states[motion].state === 'on' || hass.states[motion].state !== 0)) {
        if (this.focusMotion && this.lastMotion !== motion) {
          this.currentCamera = cam.entity;
        }
        this.lastMotion = motion;
        return;
      }
    }
    this.lastMotion = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.thumbUpdater = setInterval(() => this._updateThumbs(), this.thumbInterval);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.thumbUpdater);
    this.imageSources = null;
    this.currentCamera = '';
  }

  _firstRendered() {
    this._updateThumbs();
  }

  _updateThumbs() {
    const sources = {};
    this.cameras.forEach((camera) => {
        sources[camera.entity] = `/api/camera_proxy_stream/${camera.entity}?token=${this._hass.states[camera.entity].attributes.access_token}`;
    });
    this.imageSources = sources;
  }
}
customElements.define('surveillance-card', SurveillanceCard);