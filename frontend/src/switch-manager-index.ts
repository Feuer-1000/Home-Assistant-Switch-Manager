import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  Panel,
  Route,
  SwitchConfig,
  SwitchListItem,
  ConfigsResponse,
} from "./types";
import {
  wsType,
  navigateTo,
  navigate,
  showToast,
  showDialog,
  assetUrl,
} from "./helpers";

import "./dialogs/blueprint-selector";

@customElement("switch-manager-index")
export class SwitchManagerIndex extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) narrow = false;
  @property({ attribute: false }) panel!: Panel;
  @property({ attribute: false }) route?: Route;

  @state() private _data: SwitchListItem[] = [];

  connectedCallback() {
    super.connectedCallback();
    this._populateSwitches();
  }

  render() {
    return html`
      <ha-app-layout>
        <app-header slot="header" fixed>
          <app-toolbar>
            <ha-menu-button
              .hass=${this.hass}
              .narrow=${this.narrow}
            ></ha-menu-button>
            <div main-title>Switch Manager</div>
            <div>v${this.panel.config.version}</div>
          </app-toolbar>
        </app-header>
      </ha-app-layout>
      <hui-view>
        <hui-panel-view>
          <div class="switch-list">
            ${this._data.length === 0
              ? html`<div class="empty">No Switches configured</div>`
              : this._data.map(
                  (item) => html`
                    <ha-card
                      outlined
                      class="switch-item"
                      @click=${() => this._editSwitch(item.switch_id)}
                    >
                      <div class="card-content row">
                        <div class="image-col">
                          ${item.switch.valid_blueprint &&
                          item.switch.blueprint.has_image
                            ? html`<img
                                src="${assetUrl(item.blueprint_id + ".png")}"
                              />`
                            : html`<ha-svg-icon
                                .path=${"M13 5C15.21 5 17 6.79 17 9C17 10.5 16.2 11.77 15 12.46V11.24C15.61 10.69 16 9.89 16 9C16 7.34 14.66 6 13 6S10 7.34 10 9C10 9.89 10.39 10.69 11 11.24V12.46C9.8 11.77 9 10.5 9 9C9 6.79 10.79 5 13 5M20 20.5C19.97 21.32 19.32 21.97 18.5 22H13C12.62 22 12.26 21.85 12 21.57L8 17.37L8.74 16.6C8.93 16.39 9.2 16.28 9.5 16.28H9.7L12 18V9C12 8.45 12.45 8 13 8S14 8.45 14 9V13.47L15.21 13.6L19.15 15.79C19.68 16.03 20 16.56 20 17.14V20.5M20 2H4C2.9 2 2 2.9 2 4V12C2 13.11 2.9 14 4 14H8V12L4 12L4 4H20L20 12H18V14H20V13.96L20.04 14C21.13 14 22 13.09 22 12V4C22 2.9 21.11 2 20 2Z"}
                              ></ha-svg-icon>`}
                        </div>
                        <div class="info-col">
                          <div class="name">
                            ${item.error
                              ? html`<span class="error"
                                  >${item.name} (${item.error})</span
                                >`
                              : item.name}
                          </div>
                          ${!this.narrow
                            ? html`<div class="secondary">
                                ${item.service} / ${item.type}
                              </div>`
                            : ""}
                        </div>
                        <div class="status-col">
                          ${!item.enabled
                            ? html`<ha-svg-icon
                                class="disabled-icon"
                                .path=${"M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z"}
                              ></ha-svg-icon>`
                            : ""}
                        </div>
                        <div class="actions-col">
                          <ha-button-menu corner="BOTTOM_START">
                            <ha-icon-button
                              slot="trigger"
                              .path=${"M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"}
                              @click=${(e: Event) => e.stopPropagation()}
                            ></ha-icon-button>
                            <mwc-list-item
                              graphic="icon"
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                this._toggleEnabled(
                                  item.switch_id,
                                  item.enabled
                                );
                              }}
                            >
                              ${item.enabled ? "Disable" : "Enable"}
                              <ha-svg-icon
                                slot="graphic"
                                .path=${item.enabled
                                  ? "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M9,9V15H15V9"
                                  : "M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5L16,12L10,7.5V16.5Z"}
                              ></ha-svg-icon>
                            </mwc-list-item>
                            <mwc-list-item
                              graphic="icon"
                              class="warning"
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                this._deleteConfirm(item);
                              }}
                            >
                              Delete
                              <ha-svg-icon
                                slot="graphic"
                                class="warning"
                                .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                              ></ha-svg-icon>
                            </mwc-list-item>
                          </ha-button-menu>
                        </div>
                      </div>
                    </ha-card>
                  `
                )}
          </div>
          <div class="fab-container">
            <ha-fab
              slot="fab"
              .label=${"Add Switch"}
              extended
              @click=${this._showBlueprintDialog}
            >
              <ha-svg-icon
                slot="icon"
                .path=${"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"}
              ></ha-svg-icon>
            </ha-fab>
          </div>
        </hui-panel-view>
      </hui-view>
    `;
  }

  private _populateSwitches() {
    this.hass
      .callWS<ConfigsResponse>({ type: wsType("configs") })
      .then((res) => {
        const items: SwitchListItem[] = [];
        Object.values(res.configs).forEach((sw: any) => {
          const bp = sw.valid_blueprint
            ? sw.blueprint
            : { id: sw.blueprint, service: "", name: "" };
          items.push({
            switch: sw,
            blueprint_id: bp.id,
            switch_id: sw.id,
            error: sw._error,
            enabled: sw.enabled,
            name: sw.name,
            service: bp.service || "",
            type: bp.name || "",
            actions: sw.id,
          });
        });
        this._data = items;
      });
  }

  private _editSwitch(id: string) {
    navigate(navigateTo(`edit/${id}`));
  }

  private async _toggleEnabled(switchId: string, currentEnabled: boolean) {
    try {
      const res = await this.hass.callWS<{ enabled: boolean }>({
        type: wsType("config/enabled"),
        enabled: !currentEnabled,
        config_id: switchId,
      });
      this._populateSwitches();
      showToast(this, `Switch ${res.enabled ? "Enabled" : "Disabled"}`);
    } catch (e: any) {
      showToast(this, e.message);
    }
  }

  private async _deleteConfirm(item: SwitchListItem) {
    showDialog(
      this,
      "switch-manager-dialog-confirm",
      () => import("./dialogs/confirm"),
      {
        title: "Delete switch?",
        text: `${item.name} will be permanently deleted.`,
        confirmText: "Delete",
        dismissText: "Cancel",
        confirm: () => this._delete(item.switch_id),
        confirmation: true,
        destructive: true,
      }
    );
  }

  private async _delete(switchId: string) {
    try {
      await this.hass.callWS({
        type: wsType("config/delete"),
        config_id: switchId.toString(),
      });
      this._populateSwitches();
      showToast(this, "Switch Deleted");
    } catch (e: any) {
      showToast(this, e.message);
    }
  }

  private _showBlueprintDialog() {
    showDialog(
      this,
      "switch-manager-dialog-blueprint-selector",
      () => import("./dialogs/blueprint-selector"),
      {}
    );
  }

  static styles = css`
    :host {
      display: block;
    }
    hui-view {
      display: block;
      height: calc(100vh - var(--header-height));
      overflow-y: auto;
    }
    app-toolbar {
      height: var(--header-height);
    }
    app-header,
    app-toolbar {
      background-color: var(
        --app-header-background-color,
        var(--mdc-theme-primary)
      );
      font-weight: 400;
      color: var(--app-header-text-color, var(--mdc-theme-on-primary, #fff));
    }
    .switch-list {
      max-width: 1040px;
      margin: 16px auto;
      padding: 0 16px;
    }
    .switch-item {
      margin-bottom: 8px;
      cursor: pointer;
    }
    .switch-item:hover {
      background: var(--secondary-background-color);
    }
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .image-col {
      width: 64px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-col img {
      max-width: 100%;
      max-height: 48px;
      display: block;
    }
    .image-col ha-svg-icon {
      fill: var(--primary-color);
      width: 40px;
      height: 40px;
    }
    .info-col {
      flex: 1;
      min-width: 0;
    }
    .info-col .name {
      font-weight: 500;
    }
    .info-col .secondary {
      color: var(--secondary-text-color);
      font-size: 0.875em;
    }
    .error {
      color: red;
    }
    .status-col {
      flex-shrink: 0;
    }
    .disabled-icon {
      color: var(--secondary-text-color);
    }
    .actions-col {
      flex-shrink: 0;
    }
    .warning {
      color: var(--error-color);
    }
    .empty {
      text-align: center;
      padding: 32px;
      color: var(--secondary-text-color);
      font-size: 1.2em;
    }
    .fab-container {
      position: fixed;
      right: 0;
      bottom: 0;
      padding: 1.2em;
      z-index: 1;
    }
  `;
}
