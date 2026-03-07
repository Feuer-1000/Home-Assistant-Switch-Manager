import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("switch-manager-dialog-rename-switch")
export class SwitchManagerDialogRenameSwitch extends LitElement {
  @state() private _params?: any;
  @state() private _name = "";

  public showDialog(params: any) {
    this._params = params;
    this._name = params.config?.name || "";
  }

  public closeDialog() {
    this._params?.onClose?.();
    this._params = undefined;
  }

  render() {
    if (!this._params) return html``;
    return html`
      <ha-dialog open @closed=${this.closeDialog} heading="Rename Switch">
        <ha-textfield
          .value=${this._name}
          @input=${(e: InputEvent) =>
            (this._name = (e.target as HTMLInputElement).value)}
          label="Name"
          dialogInitialFocus
        ></ha-textfield>
        <mwc-button slot="secondaryAction" @click=${this.closeDialog}>
          Cancel
        </mwc-button>
        <mwc-button slot="primaryAction" @click=${this._save}>
          Save
        </mwc-button>
      </ha-dialog>
    `;
  }

  private _save() {
    if (this._name.trim()) {
      this._params?.update?.({ name: this._name.trim() });
    }
    this.closeDialog();
  }

  static styles = css`
    ha-textfield {
      width: 100%;
    }
  `;
}
