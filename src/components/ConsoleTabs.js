import React, { Component } from "react";
import {
  Menu,
  Input
} from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleTabs extends Component {

  constructor(props) {
    super(props);
  }

  /*
   * renders the tab component of the console view
   */
  render() {
    return (
      <div id='wrapper' className='tabs'>
        <Menu>
          <Menu.Item>
            <Input className='icon' icon='search' placeholder='Search...' />
          </Menu.Item>

          <Menu.Item position='right'>
            <Input action={{ type: 'submit', content: 'Go' }} placeholder='Navigate to...' />
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}
