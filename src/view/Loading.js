import React, { Component } from 'react';
import { Divider, Transition, Icon, Header, Progress, Segment } from 'semantic-ui-react';

export default class Loading extends Component {

	state = { 
    visible: true,
    header: {
      title: 'Loading MetaOS',
      text: 'Checking for new version...',
      icon: 'hand spock'
    },
    progress: {
    	color: 'violet',
    	value: 0,
    	total: 5,
    	label: 'Checking...'
    }
  }
  
  onHideShow = () => this.setState({ 
  	visible: !this.state.visible
  })

  render() {
  	return (
			<Segment basic>
        <Header as='h4' floated='left'>
          <Transition 
          	visible={this.state.visible} 
          	transitionOnMount 
          	animation='scale' 
          	duration={800} 
          	onHide={this.onHideShow} 
          	onShow={this.onHideShow}>
            <Icon 
            	size='big' 
            	circular 
            	inverted
            	color='violet'
            	 name={this.state.header.icon} />
          </Transition>
        </Header>
        <Header as='h3' floated='left'>
          <Header.Content>
            {this.state.header.title} 
            <Header.Subheader>
              {this.state.header.text} 
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing/>
        <Progress 
        	color={this.state.progress.color} 
        	value={this.state.progress.value}  
        	total={this.state.progress.total} 
        	progress='percent' 
        	active size='small'>
          {this.state.progress.label} 
        </Progress>
      </Segment>
    );
  }
}
