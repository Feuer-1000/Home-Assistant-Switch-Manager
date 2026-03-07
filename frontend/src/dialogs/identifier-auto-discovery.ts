import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { HomeAssistant, Blueprint } from "../types";
import { wsType } from "../helpers";

@customElement("switch-manager-dialog-identifier-auto-discovery")
export class SwitchManagerDialogIdentifierAutoDiscovery extends LitElement {
  @state() private _params?: any;
  @state() private _identifier = "";
  @state() private _discovered: string[] = [];
  @state() private _listening = false;
  private _unsubscribe?: () => void;
  private hass!: HomeAssistant;

  public showDialog(params: any) {
    this._params = params;
    this._identifier = params.identifier || "";
    this._discovered = [];
    this.hass =
      (this.parentElement as any)?.hass ||
      (document.querySelector("home-assistant") as any)?.hass;
    this._startDiscovery();
  }

  public closeDialog() {
    this._stopDiscovery();
    this._params?.onClose?.();
    this._params = undefined;
  }

  private async _startDiscovery() {
    const blueprint = this._params.blueprint as Blueprint;
    if (!blueprint) return;

    this._listening = true;
    try {
      this._unsubscribe = await this.hass.connection.subscribeMessage(
        (msg: any) => {
          if (msg.identifier && !this._discovered.includes(msg.identifier)) {
            this._discovered = [...this._discovered, msg.identifier];
          }
        },
        {
          type: wsType("blueprints/auto_discovery"),
          blueprint_id: blueprint.id,
        }
      );
    } catch {
      this._listening = false;
    }
  }

  private _stopDiscovery() {
    this._unsubscribe?.();
    this._unsubscribe = undefined;
    this._listening = false;
  }

  render() {
    if (!this._params) return html``;
    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        heading="Switch Identifier"
      >
        <div class="content">
          <ha-textfield
            .value=${this._identifier}
            @input=${(e: InputEvent) =>
              (this._identifier = (e.target as HTMLInputElement).value)}
            label="Identifier"
          ></ha-textfield>

          ${this._listening
            ? html`
                <div class="discovery">
                  <p>
                    Press a button on your switch to auto-discover its
                    identifier...
                  </p>
                  <ha-circular-progress indeterminate></ha-circular-progress>
                  ${this._discovered.length
                    ? html`
                        <div class="discovered-list">
                          ${this._discovered.map(
                            (id) => html`
                              <mwc-list-item @click=${() => this._selectIdentifier(id)}>
                                ${id}
                              </mwc-list-item>
                            `
                          )}
                        </div>
                      `
                    : ""}
                </div>
              `
            : ""}
        </div>
        <mwc-button slot="secondaryAction" @click=${this.closeDialog}>
          Cancel
        </mwc-button>
        <mwc-button slot="primaryAction" @click=${this._save}>
          Save
        </mwc-button>
      </ha-dialog>
    `;
  }

  private _selectIdentifier(id: string) {
    this._identifier = id;
  }

  private _save() {
    this._params?.update?.({ identifier: this._identifier });
    this.closeDialog();
  }

  static styles = css`
    .content {
      min-width: 300px;
    }
    ha-textfield {
      width: 100%;
    }
    .discovery {
      margin-top: 16px;
      text-align: center;
    }
    .discovered-list {
      margin-top: 8px;
      text-align: left;
    }
    mwc-list-item {
      cursor: pointer;
    }
    mwc-list-item:hover {
      background: var(--secondary-background-color);
    }
  `;
}
