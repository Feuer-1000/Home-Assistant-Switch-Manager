import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { HomeAssistant, SwitchConfig, CopyFromResponse } from "../types";
import { wsType } from "../helpers";

@customElement("switch-manager-dialog-copy-from")
export class SwitchManagerDialogCopyFrom extends LitElement {
  @state() private _params?: any;
  @state() private _switches: SwitchConfig[] = [];
  @state() private _copyVariables = true;
  private hass!: HomeAssistant;

  public showDialog(params: any) {
    this._params = params;
    this.hass =
      (this.parentElement as any)?.hass ||
      (document.querySelector("home-assistant") as any)?.hass;
    this._loadSwitches();
  }

  public closeDialog() {
    this._params?.onClose?.();
    this._params = undefined;
    this._switches = [];
  }

  private async _loadSwitches() {
    const res = await this.hass.callWS<CopyFromResponse>({
      type: wsType("copy_from_list"),
      blueprint_id: this._params.blueprint_id,
      skip_config_id: this._params.current_switch_id || "",
    });
    this._switches = res.switches;
  }

  render() {
    if (!this._params) return html``;
    return html`
      <ha-dialog open @closed=${this.closeDialog} heading="Copy From">
        <div class="content">
          ${this._switches.length === 0
            ? html`<p>No other switches with this blueprint found.</p>`
            : html`
                <ha-formfield label="Copy variables">
                  <ha-switch
                    .checked=${this._copyVariables}
                    @change=${(e: Event) =>
                      (this._copyVariables = (e.target as any).checked)}
                  ></ha-switch>
                </ha-formfield>
                <div class="switch-list">
                  ${this._switches.map(
                    (sw) => html`
                      <mwc-list-item @click=${() => this._selectSwitch(sw)}>
                        ${sw.name}
                      </mwc-list-item>
                    `
                  )}
                </div>
              `}
        </div>
        <mwc-button slot="secondaryAction" @click=${this.closeDialog}>
          Cancel
        </mwc-button>
      </ha-dialog>
    `;
  }

  private _selectSwitch(sw: SwitchConfig) {
    this._params?.update?.({
      buttons: JSON.parse(JSON.stringify(sw.buttons)),
      variables: this._copyVariables
        ? JSON.parse(JSON.stringify(sw.variables || {}))
        : false,
    });
    this.closeDialog();
  }

  static styles = css`
    .content {
      min-width: 300px;
    }
    .switch-list {
      margin-top: 8px;
    }
    mwc-list-item {
      cursor: pointer;
    }
    ha-formfield {
      display: block;
      margin-bottom: 8px;
    }
  `;
}
