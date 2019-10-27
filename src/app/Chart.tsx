import { TimeSeries, TimeRange } from 'pondjs';
import React, { PureComponent } from 'react';
import {
  ChartContainer,
  ChartRow,
  Charts,
  Legend,
  LineChart,
  Resizable,
  styler,
  YAxis,
  EventMarker,
} from 'react-timeseries-charts';
import styled from 'styled-components';
import { Record } from '../server/Store';

enum Columns {
  download = 'download',
  upload = 'upload',
  ping = 'ping',
}
type Props = { data: Record[] };
type State = {
  timeRange: any;
  trackerPosition?: string;
  selected: { [key in Columns]: boolean };
};

export default class Chart extends PureComponent<Props, State> {
  state: State = {
    timeRange: new TimeRange([Date.now() - 1000 * 60 * 60 * 24, Date.now()]),
    selected: {
      [Columns.download]: false,
      [Columns.upload]: false,
      [Columns.ping]: false,
    },
  };

  handleTrackerChanged = (trackerPosition: any) => {
    this.setState({ trackerPosition });
  };

  handleTimeRangeChange = (timeRange: TimeRanges) => {
    this.setState({ timeRange });
  };

  getAlignWindow() {
    const duration = this.state.timeRange.humanizeDuration();
    if (duration.includes('month')) {
      return '1h';
    }
    if (duration.includes('day')) {
      return '10m';
    }
    if (duration.includes('hour')) {
      return '5m';
    }
    if (duration.includes('minute')) {
      return '5s';
    }
  }

  getMarkerData = (series: any) => {
    if (!this.state.trackerPosition) {
      return { event: null, label: null };
    }
    const event = series.atTime(this.state.trackerPosition);
    const download = event.get(Columns.download).toFixed(2);
    const upload = event.get(Columns.upload).toFixed(2);
    const ping = event.get(Columns.ping).toFixed(0);
    return { event, download, upload, ping };
  };

  render() {
    const data = {
      name: 'speeds',
      columns: ['time', Columns.download, Columns.upload, Columns.ping],
      points: this.props.data.map(record => [record.timestamp, record.download, record.upload, record.ping]),
    };
    const initialSeries = new TimeSeries(data);
    const series = initialSeries
      .fill({
        fieldSpec: [Columns.download, Columns.upload, Columns.ping],
        method: 'zero',
        limit: 3,
      })
      .align({
        fieldSpec: [Columns.download, Columns.upload, Columns.ping],
        period: this.getAlignWindow(),
      });
    const markerData = this.getMarkerData(series);
    return (
      <div>
        <Resizable>
          <ChartContainer
            minDuration={1000 * 60 * 5}
            maxTime={new Date()}
            enablePanZoom={true}
            timeRange={this.state.timeRange}
            onTimeRangeChanged={this.handleTimeRangeChange}
            onTrackerChanged={this.handleTrackerChanged}
          >
            <ChartRow height="500">
              <YAxis
                id="speed"
                label="Speed Mbps"
                min={0}
                max={Math.max(10, series.crop(this.state.timeRange).max(Columns.download))}
                type="linear"
                format=",.0f"
                transition={400}
                width={20}
                labelOffset={50}
                style={{ ticks: { display: 'none' }, axis: { display: 'none' } }}
              />
              <Charts>
                <LineChart
                  axis={Columns.ping}
                  series={series}
                  columns={[Columns.ping]}
                  style={style}
                  interpolation="curveMonotoneX"
                  selection={this.state.selected[Columns.ping]}
                />
                <LineChart
                  axis="speed"
                  series={series}
                  columns={[Columns.upload]}
                  style={style}
                  interpolation="curveMonotoneX"
                  selection={this.state.selected[Columns.upload]}
                />
                <LineChart
                  axis="speed"
                  series={series}
                  columns={[Columns.download]}
                  style={style}
                  interpolation="curveMonotoneX"
                  selection={this.state.selected[Columns.download]}
                />
                <EventMarker
                  type="point"
                  axis="speed"
                  event={markerData.event}
                  column={Columns.download}
                  markerLabel={`${markerData.download} Mbps`}
                  markerLabelAlign="left"
                  markerLabelStyle={{ fill: '#ccd1c2', stroke: 'black' }}
                  markerRadius={4}
                  markerStyle={{ fill: COLOR_DOWNLOAD }}
                />
                <EventMarker
                  type="point"
                  axis="speed"
                  event={markerData.event}
                  column={Columns.upload}
                  markerLabel={`${markerData.upload} Mbps`}
                  markerLabelAlign="left"
                  markerLabelStyle={{ marginLeft: 2, fill: '#ccd1c2', stroke: 'black' }}
                  markerRadius={4}
                  markerStyle={{ fill: COLOR_UPLOAD }}
                />
                <EventMarker
                  type="point"
                  axis={Columns.ping}
                  event={markerData.event}
                  column={Columns.ping}
                  markerLabel={`${markerData.ping}ms`}
                  markerLabelAlign="left"
                  markerLabelStyle={{ fill: '#ccd1c2', stroke: 'black' }}
                  markerRadius={4}
                  markerStyle={{ fill: COLOR_PING }}
                />
              </Charts>
              <YAxis
                id={Columns.ping}
                label="Ping"
                min={0}
                max={series.crop(this.state.timeRange).max(Columns.ping)}
                type="linear"
                format=",.0s"
                transition={400}
                width={30}
                labelOffset={-50}
                style={{ ticks: { display: 'none' }, axis: { display: 'none' } }}
              />
            </ChartRow>
          </ChartContainer>
        </Resizable>
        <LegendContainer>
          <Legend
            type="line"
            align="right"
            style={style}
            labelStyle={{ color: '#ffffff', fontSize: '30px' }}
            categories={[
              {
                key: Columns.download,
                label: 'Download',
                disabled: this.state.selected[Columns.download],
                style: { backgroundColor: COLOR_DOWNLOAD },
              },
              {
                key: Columns.upload,
                label: 'Upload',
                disabled: this.state.selected[Columns.upload],
                style: { backgroundColor: COLOR_UPLOAD },
              },
              {
                key: Columns.ping,
                label: 'Ping',
                disabled: this.state.selected[Columns.ping],
                style: { backgroundColor: COLOR_PING },
              },
            ]}
            onSelectionChange={(highlight: Columns) =>
              this.setState({
                selected: {
                  ...this.state.selected,
                  [highlight]: !this.state.selected[highlight],
                },
              })
            }
          />
        </LegendContainer>
      </div>
    );
  }
}

const COLOR_DOWNLOAD = '#63a055';
const COLOR_UPLOAD = '#a03828';
const COLOR_PING = '#9e49a0';

const style = styler([
  { key: Columns.download, color: COLOR_DOWNLOAD, selected: 'white', width: 3 },
  { key: Columns.upload, color: COLOR_UPLOAD, selected: 'white', width: 3 },
  { key: Columns.ping, color: COLOR_PING, selected: 'white', width: 2, dashed: true },
]);

const LegendContainer = styled.div`
  * {
    color: white !important;
  }
`;
