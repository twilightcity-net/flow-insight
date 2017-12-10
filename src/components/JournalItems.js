import React, { Component } from "react";
import { Grid, Segment } from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class JournalItems extends Component {
  constructor(props) {
    super(props);
  }

  /*
   * renders the tab component of the console view
   */
  render() {
    return (
      <div id="component" className="journalItems">
        <Grid inverted>
          <Grid.Row>
            <Grid.Column width={2}>
              <div className="chunkTitle">torchie/US143242</div>
            </Grid.Column>
            <Grid.Column width={14}>
              <div className="chunkText">
                Te eum doming eirmod, nominati pertinacia argumentum ad his.
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={2}>
              <div className="chunkTitle">torchie/US157874</div>
            </Grid.Column>
            <Grid.Column width={14}>
              <div className="chunkText">
                Pellentesque habitant morbi tristique senectus.
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={2}>
              <div className="chunkTitle">torchie/US153345</div>
            </Grid.Column>
            <Grid.Column width={14}>
              <div className="chunkText">
                Eu quo homero blandit intellegebat. Incorrupte consequuntur mei
                id.
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={2}>
              <div className="chunkTitle">torchie/US152224</div>
            </Grid.Column>
            <Grid.Column width={14}>
              <div className="chunkText">
                nominati quo argumentum tristique doming. homero senectus mei
                Pellentesque.
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={2}>
              <div className="chunkTitle">torchie/US154445</div>
            </Grid.Column>
            <Grid.Column width={14}>
              <div className="chunkText">
                argumentum eirmod morbi Incorrupte intellegebat.
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={2}>
              <div className="chunkTitle">torchie/US233556</div>
            </Grid.Column>
            <Grid.Column width={14}>
              <div className="chunkText">
                Eu quo homero blandit intellegebat. Incorrupte consequuntur mei
                id.
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={2}>
              <div className="chunkTitle">torchie/US233453</div>
            </Grid.Column>
            <Grid.Column width={14}>
              <div className="chunkText">
                Doming. homero senectus mei Pellentesque. Incorrupte
                consequuntur mei id.
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}
