import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import JournalItem from "./JournalItem";

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
          <JournalItem
            projectId="torchie"
            chunkId="US143242"
            chunkText="Incorrupte consequuntur mei quo argumentum tristique doming. homero senectus mei argumentum eirmod morbi."
          />
          <JournalItem
            projectId="torchie"
            chunkId="US157874"
            chunkText="Pellentesque habitant morbi tristique senectus."
          />
          <JournalItem
            projectId="torchie"
            chunkId="US153345"
            chunkText="Eu quo homero blandit intellegebat. Incorrupte consequuntur mei id."
          />
          <JournalItem
            projectId="torchie"
            chunkId="US152224"
            chunkText="nominati quo argumentum tristique doming. homero senectus mei Pellentesque."
          />
          <JournalItem
            projectId="torchie"
            chunkId="US154445"
            chunkText="argumentum eirmod morbi Incorrupte intellegebat."
          />
          <JournalItem
            projectId="torchie"
            chunkId="US233556"
            chunkText="Eu quo homero blandit intellegebat. Incorrupte consequuntur mei id."
          />
          <JournalItem
            projectId="torchie"
            chunkId="US233453"
            chunkText="Doming. homero senectus mei Pellentesque. Incorrupte consequuntur mei id."
          />
        </Grid>
      </div>
    );
  }
}
