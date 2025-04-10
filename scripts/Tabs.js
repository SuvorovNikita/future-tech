const rootSelector = "[data-js-tabs]";

class Tabs {
  selectors = {
    root: rootSelector,
    button: "[data-js-tabs-button]",
    tabContent: "[data-js-tabs-content]",
  };

  stateClasses = {
    isActive: "is-active",
  };

  stateAttributes = {
    ariaSelected: "aria-selected",
    tabIndex: "tabindex",
  };

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.buttonElements = this.rootElement.querySelectorAll(
      this.selectors.button
    );

    this.contentElements = this.rootElement.querySelectorAll(
      this.selectors.tabContent
    );
    this.state = this.ProxyState({
      activeTabIndex: [...this.buttonElements].findIndex((buttonElement) =>
        buttonElement.classList.contains(this.stateClasses.isActive)
      ),
    });

    this.LimitTabsIndex = this.buttonElements.length - 1;
    this.bindEvents();
  }

  ProxyState(initialState) {
    return new Proxy(initialState, {
      get: (target, prop) => {
        return target[prop];
      },
      set: (target, prop, value) => {
        target[prop] = value;
        this.updateUI();
        return true;
      },
    });
  }

  updateUI() {
    const { activeTabIndex } = this.state;
    this.buttonElements.forEach((buttonElement, index) => {
      const isActive = index === activeTabIndex;

      buttonElement.classList.toggle(this.stateClasses.isActive, isActive);
      buttonElement.setAttribute(
        this.stateAttributes.ariaSelected,
        isActive.toString
      );
      buttonElement.setAttribute(
        this.stateAttributes.tabIndex,
        isActive ? "0" : "-1"
      );
    });

    this.contentElements.forEach((contentElement, index) => {
      const isActive = index === activeTabIndex;

      contentElement.classList.toggle(this.stateClasses.isActive, isActive);
      contentElement.setAttribute(
        this.stateAttributes.tabIndex,
        isActive.toString
      );
    });
  }

  activateTab(newTabIndex) {
    if (newTabIndex < 0 || newTabIndex > this.LimitTabsIndex) {
      return;
    }
    this.state.activeTabIndex = newTabIndex;
    this.buttonElements[newTabIndex].focus();
  }

  previousTab = () => {
    const newTabIndex =
      this.state.activeTabIndex === 0
        ? this.LimitTabsIndex
        : this.state.activeTabIndex - 1;
    this.activateTab(newTabIndex);
  };

  nextTab = () => {
    const newTabIndex =
      this.state.activeTabIndex === this.LimitTabsIndex
        ? 0
        : this.state.activeTabIndex + 1;
    this.activateTab(newTabIndex);
  };

  firstTab = () => {
    this.activateTab(0);
  };

  lastTab = () => {
    this.activateTab(this.LimitTabsIndex);
  };

  onButtonClick(buttonIndex) {
    this.state.activeTabIndex = buttonIndex;
  }

  onKeyDown = (event) => {
    const { code, metaKey } = event;
    const action = {
      ArrowLeft: this.previousTab,
      ArrowRight: this.nextTab,
      Home: this.firstTab,
      End: this.lastTab,
    }[code];

    const isMacHomeKey = code === metaKey && code === "ArrowLeft";
    if (isMacHomeKey) {
      this.firstTab();

      return;
    }

    const isMacEndKey = code === metaKey && code === "ArrowRight";
    if (isMacEndKey) {
      this.lastTab();

      return;
    }

    action?.();
  };

  bindEvents() {
    this.buttonElements.forEach((buttonElement, index) => {
      buttonElement.addEventListener("click", () => this.onButtonClick(index));
    });

    this.rootElement.addEventListener("keydown", this.onKeyDown);
  }
}

class TabsCollection {
  constructor() {
    this.init();
  }
  init() {
    document
      .querySelectorAll(rootSelector)
      .forEach((element) => new Tabs(element));
  }
}

export default TabsCollection;
