class Topbar extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({mode: 'open'});
        this.container = document.createElement('div');
        this.container.className = "container";
        this.root.appendChild(this.container);
        this.container.innerHTML = this.template();
    }

    template() {
        return `
        ${this.style()}

    <a class="logo">
      <svg viewBox="0 0 24 24">
        <path d="M9.199 13.599c0.992 1.327 2.43 2.126 3.948 2.345s3.123-0.142 4.45-1.134c0.239-0.179 0.465-0.375 0.655-0.568l2.995-2.995c1.163-1.204 1.722-2.751 1.696-4.285s-0.639-3.061-1.831-4.211c-1.172-1.132-2.688-1.692-4.199-1.683-1.492 0.008-2.984 0.571-4.137 1.683l-1.731 1.721c-0.392 0.389-0.394 1.023-0.004 1.414s1.023 0.394 1.414 0.004l1.709-1.699c0.77-0.742 1.763-1.117 2.76-1.123 1.009-0.006 2.016 0.367 2.798 1.122 0.795 0.768 1.203 1.783 1.221 2.808s-0.355 2.054-1.11 2.836l-3.005 3.005c-0.114 0.116-0.263 0.247-0.428 0.37-0.885 0.662-1.952 0.902-2.967 0.756s-1.971-0.678-2.632-1.563c-0.331-0.442-0.957-0.533-1.4-0.202s-0.533 0.957-0.202 1.4zM14.801 10.401c-0.992-1.327-2.43-2.126-3.948-2.345s-3.124 0.142-4.451 1.134c-0.239 0.179-0.464 0.375-0.655 0.568l-2.995 2.995c-1.163 1.204-1.722 2.751-1.696 4.285s0.639 3.061 1.831 4.211c1.172 1.132 2.688 1.692 4.199 1.683 1.492-0.008 2.984-0.571 4.137-1.683l1.723-1.723c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-1.696 1.698c-0.77 0.742-1.763 1.117-2.76 1.123-1.009 0.006-2.016-0.367-2.798-1.122-0.795-0.768-1.203-1.783-1.221-2.808s0.355-2.054 1.11-2.836l3.005-3.005c0.114-0.116 0.263-0.247 0.428-0.37 0.885-0.662 1.952-0.902 2.967-0.756s1.971 0.678 2.632 1.563c0.331 0.442 0.957 0.533 1.4 0.202s0.533-0.957 0.202-1.4z">
        </path>
      </svg>
    </a>
  
    <!--<div class="nav-item">
      更多
    </div>-->
        `;
    }

    style() {
        return `
        <style>
.container
{
    outline: 0;
    transition: background-color .4s cubic-bezier(.67,0,.33,1);
    position: relative;
    box-sizing: border-box;
    padding: 0 10px;
    background-color: #fff;
    box-shadow: 0 2px 2px 0 rgba(207,216,221,.7);
    border-bottom: none;
    display: flex;
}
.logo
{
    display: flex;
    height: 54px;
    width: 54px;
    align-items: center;
    justify-content: center;
}
.logo>svg
{
    width: 24px;
    height: 24px;
}
.nav-item
{
    display: inline-block;
    line-height: 54px;
    height: 54px;
    font-size: 14px;
    transition: background-color .4s;
    padding: 0 10px;
    color: #00a4ff;
}
        </style>`;
    }
}

customElements.define('top-bar', Topbar);