class CustomBottomSheet extends HTMLElement {

  constructor() {
    super();

    this.root = this.attachShadow({ mode: 'open' });

    this.root.innerHTML = `<style>.menu-item
{
    -webkit-box-direction: normal;
    color: #030303;
    padding: 0;
    height: 48px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
}
#overlay
{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    cursor: pointer;
    background-color: rgba(0,0,0,.6);
}
#hidden-button
{
    word-wrap: break-word;
    -webkit-text-size-adjust: 100%;
    padding: 0;
    border: none;
    outline: none;
    font: inherit;
    text-transform: inherit;
    color: inherit;
    background: transparent;
    cursor: pointer;
    position: fixed;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
}
.menu-item-button
{
    border: none;
    outline: none;
    font: inherit;
    color: inherit;
    background: transparent;
    cursor: pointer;
    box-sizing: border-box;
    text-align: initial;
    text-transform: unset;
    width: 100%;
    display: flex;
    padding: 0;
    margin-left: 12px;
    font-size: 1.6rem;
    line-height: 2.2rem;
    justify-content: center;
}
.layout
{
    border-radius: 12px;
    background-color: #fff;
    display: block;
    overflow: hidden;
    position: fixed;
    margin: 0 8px 24px;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
}
.header
{
    overflow: hidden;
    -webkit-box-flex: 0;
    flex: none;
    border-bottom: 1px solid #fff;
}
.body
{
    flex: 1;
    overflow-y: hidden;
    max-height: 325.2px;
    display: flex;
    flex-direction: column;
    color: #030303;
    min-height: 150px;
}
.items
{
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 1px;
    background-color: #dadce0;
    border: 1px solid #dadce0;
}
.items>div
{
    font-size: 16px;
    display: flex;
    background: #fff;
    padding: 12px;
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
}</style>
    <div id="overlay">
      <button id="hidden-button">
      </button>
    </div>
    <div class="layout">
      <div class="header">
        <div style="background: #030303; opacity: .15; border-radius: 4px; height: 4px; margin: 0 auto; width: 40px; margin-top: 8px;">
        </div>
        <div style="-webkit-box-pack: justify; justify-content: space-between; display: flex; margin-top: 8px;">
        </div>
      </div>
      <div class="body">
        <div class="items">
          <div>
            删除
          </div>
          <div>
            高清
          </div>
          <div>
            视频
          </div>
          <div>
            音乐
          </div>
          <div>已发布</div>
          <div>打开</div>
        </div>
        <div style="flex-grow: 1;">
        </div>
        <div class="menu-item" id="close-action">
          <button class="menu-item-button">
            取消
          </button>
        </div>
      </div>
    </div>`;
    const overlay = this.root.querySelector('#overlay');
    overlay.addEventListener('click', evt => {
      this.remove();
    })
    const closeAction = this.root.querySelector('#close-action');
    closeAction.addEventListener('click', evt => {
      this.remove();
    })


    this.root.querySelectorAll('.items>div')
      .forEach((x, key) => {
        x.addEventListener('click', evt => {
          this.dispatchEvent(new CustomEvent('submit', {
            detail: key
          }))
        })
      })

  }

  appendPlayButton() {
    const menuItem = document.createElement('div');
    menuItem.setAttribute("class", "menu-item");
    const menuItemButton = document.createElement('button');
    menuItemButton.setAttribute("class", "menu-item-button");
    menuItem.appendChild(menuItemButton);
    menuItemButton.textContent = `播放`;
    menuItem.addEventListener('click', evt => {
      window.open(`video.html${this.root.host.dataset.path}`, '_blank')
    });
    this.root.querySelector('#close-action').insertAdjacentElement(
      'beforebegin', menuItem
    )
  }

  appendFavorite() {
    const menuItem = document.createElement('div');
    menuItem.setAttribute("class", "menu-item");
    const menuItemButton = document.createElement('button');
    menuItemButton.setAttribute("class", "menu-item-button");
    menuItem.appendChild(menuItemButton);
    menuItemButton.textContent = `加入收藏`;
    menuItem.addEventListener('click', evt => {
      this.dispatchEvent(new CustomEvent('fav'));
    });
    this.root.querySelector('#close-action').insertAdjacentElement(
      'beforebegin', menuItem
    )
  }

  static get observedAttributes() {
    return ['data'];
  }


  connectedCallback() {

    this.root.host.style.userSelect = 'none';

    // this.dispatchEvent(new CustomEvent());
    /*
    this.dispatchEvent(new CustomEvent('submit', {
              detail: 0
          }));
          */
  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'data') {
      const obj = JSON.parse(newVal);
    }
  }

}

customElements.define('custom-bottom-sheet', CustomBottomSheet);
/*
<!--\
<custom-bottom-sheet></custom-bottom-sheet>
<script src="custom-bottom-sheet.js"></script>
const customBottomSheet = document.querySelector('custom-bottom-sheet');
const customBottomSheet = document.createElement('custom-bottom-sheet');
customBottomSheet.setAttribute('data',JSON.stringify(obj));
document.body.appendChild(customBottomSheet);
-->
*/