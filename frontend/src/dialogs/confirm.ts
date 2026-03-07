import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("switch-manager-dialog-confirm")
export class SwitchManagerDialogConfirm extends LitElement {
  @state() private _params?: any;

  public showDialog(params: any) {
    this._params = params;
  }

  public closeDialog() {
    this._params = undefined;
  }

  render() {
    if (!this._params) return html``;
    return html`
      <ha-dialog
        open
        @closed=${this._dismiss}
        .heading=${this._params.title || "Confirm"}
      >
        <div>${this._params.text || ""}</div>
        ${this._params.prompt
          ? html`<ha-textfield id="prompt-input" .value=${this._params.promptValue || ""}></ha-textfield>`
          : ""}
        <mwc-button slot="secondaryAction" @click=${this._dismiss}>
          ${this._params.dismissText || "Cancel"}
        </mwc-button>
        <mwc-button
          slot="primaryAction"
          @click=${this._confirm}
          class=${this._params.destructive ? "destructive" : ""}
        >
          ${this._params.confirmText || "OK"}
        </mwc-button>
      </ha-dialog>
    `;
  }

  private _dismiss() {
    this._params?.cancel?.();
    this.closeDialog();
  }

  private _confirm() {
    this._params?.confirm?.();
    this.closeDialog();
  }

  static styles = css`
    .destructive {
      --mdc-theme-primary: var(--error-color);
    }
  `;
}
