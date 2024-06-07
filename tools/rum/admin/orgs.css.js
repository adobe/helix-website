// eslint-disable-next-line import/no-unresolved
import { css } from 'lit';

export default css`
  :host {
    width: 100%;
    display: flex;
    flex-direction: column;
    color: var(--spectrum-global-color-gray-800);
    box-sizing: border-box;
    overflow-y: auto;
  }

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - var(--nav-height));
  }

  #nav {
    display: flex;
    justify-content: space-between;
    margin: 12px 6px;
  }

  #main {
    margin: 6px;
  }

  .confirm-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .confirm-dialog__content {
    margin: 1px;
  }

  .confirm-dialog__actions {
    display: flex;
    gap: 24px;
  }

  .table-cell-row {
    display: flex;
  }

  .row-content {
    flex-grow: 1;
  }
`;
