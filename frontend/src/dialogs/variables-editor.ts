import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("switch-manager-dialog-variables-editor")
export class SwitchManagerDialogVariablesEditor extends LitElement {
  @state() private _params?: any;
  @state() private _variables: Record<string, unknown> = {};

  public showDialog(params: any) {
    this._params = params;
    this._variables = JSON.parse(
      JSON.stringify(params.config?.variables || {})
    );
  }

  public closeDialog() {
    this._params?.onClose?.();
    this._params = undefined;
  }

  render() {
    if (!this._params) return html``;
    return html`
      <ha-dialog open @closed=${this.closeDialog} heading="Variables">
        <div class="content">
          <ha-yaml-editor
            .value=${this._variables}
            @value-changed=${(e: CustomEvent) =>
              (this._variables = e.detail.value)}
          ></ha-yaml-editor>
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

  private _save() {
    this._params?.update?.({ variables: this._variables });
    this.closeDialog();
  }

  static styles = css`
    .content {
      min-width: 400px;
    }
  `;
}
