import React from "react";
import "./Events.scss";
import { AppProps } from "index";
import DataSource from "components/DataSource";

function Event(event: any) {
  return (
    <div key={event.id}>
      {event.title} {event.start}-{event.end}
    </div>
  );
}

export class Events extends React.Component<AppProps> {
  render() {
    let query = { start: "2023-06-06", end: "2023-06-07" };
    return (
      <DataSource dataSource={async () => await this.props.urlFetch("events", query)}>
        {({ data }: { data: any }) => data.map(Event)}
      </DataSource>
    );
  }
}
