import React, { Component } from 'react';

export default class ScrollToTop extends Component {

  constructor(props) {
    super(props);
    this.state = {
      is_visible: false
    };
  }

  componentDidMount() {
    var scrollComponent = this;
    document.addEventListener("scroll", function(e) {
      scrollComponent.toggleVisibility();
    });
  }

  toggleVisibility() {
    if (window.pageYOffset > 600) {
          <div onClick={() => this.scrollToTop()}>
            {/* <ScrollAnim /> */}
            <i className="fa-solid fa-arrow-up text-white"></i>
          </div>
        )}
      </div>
    );
  }
}
