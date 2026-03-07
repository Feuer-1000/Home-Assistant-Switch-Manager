import { LitElement, html, css } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import type { HomeAssistant, BlueprintButtonAction, SwitchConfigButtonAction } from "./types";

@customElement("switch-manager-button-actions")
export class SwitchManagerButtonActions extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) blueprint_actions?: BlueprintButtonAction[];
  @property({ attribute: false }) config_actions?: SwitchConfigButtonAction[];
  @property({ type: Number, reflect: true }) index = 0;
  @state() private scrollable = true;
  @query("paper-tabs", true) tabs?: HTMLElement;

  render() {
    if (!this.blueprint_actions || this.blueprint_actions.length <= 1) {
      return html``;
    }

    return html`
      <paper-tabs
        selected="${this.index}"
        @iron-select=${this._tabChanged}
        ?scrollable=${this.scrollable}
      >
        ${this.blueprint_actions.map((action, idx) => {
          const seqLen = this.config_actions?.[idx]?.sequence?.length || 0;
          return html`
            <paper-tab index="${idx}">
              ${action.title}
              ${seqLen
                ? html`<ha-assist-chip
                    filled
                    .label="${seqLen}"
                  ></ha-assist-chip>`
                : ""}
              ${action.title === "init"
                ? html`<div id="init-suffix">
                    <ha-svg-icon
                      slot="graphic"
                      .path=${"M7,8L2.5,12L7,16V8M17,8V16L21.5,12L17,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"}
                    ></ha-svg-icon>
                  </div>`
                : ""}
            </paper-tab>
          `;
        })}
      </paper-tabs>
    `;
  }

  async updated(changedProps: Map<string, unknown>) {
    if (!this.tabs) return;
    if (changedProps.has("config_actions")) {
      this.scrollable = true;
      await this.updateComplete;
      let totalWidth = 0;
      for (const child of Array.from(this.tabs.children)) {
        totalWidth += (child as HTMLElement).offsetWidth;
      }
      this.scrollable = totalWidth > this.tabs.offsetWidth;
    }
  }

  flash(index: number) {
    const tab = this.tabs?.querySelector(`[index="${index}"]`) as HTMLElement;
    if (tab) {
      tab.removeAttribute("feedback");
      tab.setAttribute("feedback", "");
      setTimeout(() => tab.removeAttribute("feedback"), 1000);
    }
  }

  private _tabChanged(e: CustomEvent) {
    const detail = e.detail as { item: HTMLElement };
    const parent = detail.item.parentNode as HTMLElement;
    const idx = Array.from(parent.children).indexOf(detail.item);
    this.dispatchEvent(
      new CustomEvent("changed", { detail: { index: idx } })
    );
  }

  static styles = css`
    @keyframes feedback {
      to {
        border-color: #00e903;
        color: #00e903;
      }
    }
    :host {
      display: flex;
      justify-content: center;
      --paper-tab-ink: transparent;
      --paper-tabs-selection-bar-color: transparent;
    }
    paper-tabs {
      display: grid;
      justify-content: center;
      flex: 1 1 0%;
      height: var(--header-height);
      margin: 0 10px;
    }
    paper-tabs[scrollable] {
      display: flex;
    }
    paper-tab {
      padding: 0px 32px;
      box-sizing: border-box;
      text-transform: uppercase;
    }
    paper-tab[feedback] {
      animation: 0.4s feedback;
      animation-iteration-count: 2;
      animation-direction: alternate;
    }
    paper-tab.iron-selected {
      border-bottom: 2px solid var(--primary-color);
      color: var(--primary-color);
    }
    ha-assist-chip {
      position: absolute;
      top: 0;
      right: -32px;
      --_leading-space: 12px;
      --_trailing-space: 12px;
    }
    #init-suffix {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: auto;
      position: relative;
      padding: 0 12px;
      overflow: hidden;
      vertical-align: middle;
    }
  `;
}
