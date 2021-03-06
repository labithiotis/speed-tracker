import { TimeSeries, TimeRange, median, filter } from 'pondjs';
import React, { PureComponent, Fragment } from 'react';
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

type ChartProps = { data: Record[] };
type ChartState = { timeRange: TimeRange };

const ONE_DAY = 1000 * 60 * 60 * 24;

export default class Chart extends PureComponent<ChartProps, ChartState> {
  state = {
    timeRange: new TimeRange([Date.now() - 1000 * 60 * 60 * 24 * 7, Date.now()]),
  };

  updateTimeRange = (timeRange: TimeRange) => {
    this.setState({ timeRange });
  };

  setTimeRange = (type: string) => () => {
    switch (type) {
      case 'today': {
        const timeRange = this.state.timeRange.setBegin(new Date(Date.now() - ONE_DAY)).setEnd(new Date());
        this.setState({ timeRange });
        break;
      }
      case 'week': {
        const timeRange = this.state.timeRange.setBegin(new Date(Date.now() - ONE_DAY * 7)).setEnd(new Date());
        this.setState({ timeRange });
        break;
      }
      case 'month': {
        const timeRange = this.state.timeRange.setBegin(new Date(Date.now() - ONE_DAY * 30)).setEnd(new Date());
        this.setState({ timeRange });
        break;
      }
      case 'year': {
        const timeRange = this.state.timeRange.setBegin(new Date(Date.now() - ONE_DAY * 365)).setEnd(new Date());
        this.setState({ timeRange });
        break;
      }
    }
  };

  getAlignWindow() {
    const duration = this.state.timeRange.humanizeDuration();
    if (duration.includes('months')) {
      return '1d';
    }
    if (duration.includes('month')) {
      return '12h';
    }
    if (duration.includes('days')) {
      return '6h';
    }
    if (duration.includes('day')) {
      return '1h';
    }
    if (duration.includes('hours')) {
      return '30m';
    }
    if (duration.includes('hour')) {
      return '10m';
    }
    if (duration.includes('minute')) {
      return '1m';
    }
    return '1d';
  }

  cropRange() {
    const begin = this.state.timeRange.begin();
    const end = this.state.timeRange.end();
    const duration = this.state.timeRange.duration() / 2;
    return this.state.timeRange.setBegin(new Date(begin - duration)).setEnd(new Date(end + duration));
  }

  render() {
    const data = {
      name: 'speeds',
      columns: ['time', Columns.download, Columns.upload, Columns.ping],
      points: this.props.data.map(record => [record.timestamp, record.download, record.upload, record.ping]),
    };
    const series = new TimeSeries(data).crop(this.cropRange()).fixedWindowRollup({
      windowSize: this.getAlignWindow(),
      aggregation: {
        [Columns.download]: { [Columns.download]: median(filter.ignoreMissing) },
        [Columns.upload]: { [Columns.upload]: median(filter.ignoreMissing) },
        [Columns.ping]: { [Columns.ping]: median(filter.ignoreMissing) },
      },
    });

    return (
      <Fragment>
        <DateContainer>
          <DateSelection onClick={this.setTimeRange('year')}>Last year</DateSelection>
          <DateSelection onClick={this.setTimeRange('month')}>Last month</DateSelection>
          <DateSelection onClick={this.setTimeRange('week')}>Last week</DateSelection>
          <DateSelection onClick={this.setTimeRange('today')}>Today</DateSelection>
        </DateContainer>
        <Charting series={series} timeRange={this.state.timeRange} updateTimeRange={this.updateTimeRange} />
      </Fragment>
    );
  }
}

type ChartingProps = {
  series: TimeSeries;
  timeRange: TimeRange;
  updateTimeRange: (timeRange: TimeRange) => void;
};

type State = {
  selection?: string;
  trackerPosition?: string;
  selected: { [key in Columns]: boolean };
};

export class Charting extends PureComponent<ChartingProps, State> {
  state: State = {
    selected: {
      [Columns.download]: true,
      [Columns.upload]: true,
      [Columns.ping]: true,
    },
  };

  updateTrackerPosition = (trackerPosition: string) => {
    this.setState({ trackerPosition });
  };

  updateSelection = (selection: string) => {
    this.setState({ selection: this.state.selection === selection ? undefined : selection });
  };

  getMarkerData = (series: TimeSeries) => {
    if (!this.state.trackerPosition) {
      return { event: null, label: null };
    }

    const event = series.atTime(this.state.trackerPosition);

    if (!event) {
      return { event: null, label: null };
    }

    const download = event.get(Columns.download).toFixed(2);
    const upload = event.get(Columns.upload).toFixed(2);
    const ping = event.get(Columns.ping).toFixed(0);
    return { event, download, upload, ping };
  };

  render() {
    const { series } = this.props;
    const markerData = this.getMarkerData(series);
    return (
      <div>
        <Resizable>
          <ChartContainer
            minDuration={1000 * 60 * 60 * 6}
            maxTime={new Date()}
            enablePanZoom={true}
            timeRange={this.props.timeRange}
            onTimeRangeChanged={this.props.updateTimeRange}
            onTrackerChanged={this.updateTrackerPosition}
          >
            <ChartRow height="500" trackerShowTime={true}>
              <YAxis
                id="speed"
                label="Speed Mbps"
                min={0}
                max={Math.max(10, series.crop(this.props.timeRange).max(Columns.download))}
                type="linear"
                format=",.0f"
                transition={400}
                width={30}
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
                  visible={this.state.selected[Columns.ping]}
                  selection={this.state.selection}
                  onSelectionChange={this.updateSelection}
                />
                <LineChart
                  axis="speed"
                  series={series}
                  columns={[Columns.upload]}
                  style={style}
                  interpolation="curveMonotoneX"
                  visible={this.state.selected[Columns.upload]}
                  selection={this.state.selection}
                  onSelectionChange={this.updateSelection}
                />
                <LineChart
                  axis="speed"
                  series={series}
                  columns={[Columns.download]}
                  style={style}
                  interpolation="curveMonotoneX"
                  visible={this.state.selected[Columns.download]}
                  selection={this.state.selection}
                  onSelectionChange={this.updateSelection}
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
                max={series.crop(this.props.timeRange).max(Columns.ping)}
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
                disabled: !this.state.selected[Columns.download],
                style: { backgroundColor: COLOR_DOWNLOAD },
              },
              {
                key: Columns.upload,
                label: 'Upload',
                disabled: !this.state.selected[Columns.upload],
                style: { backgroundColor: COLOR_UPLOAD },
              },
              {
                key: Columns.ping,
                label: 'Ping',
                disabled: !this.state.selected[Columns.ping],
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
  { key: Columns.download, color: COLOR_DOWNLOAD, width: 3 },
  { key: Columns.upload, color: COLOR_UPLOAD, width: 3 },
  { key: Columns.ping, color: COLOR_PING, width: 2, dashed: true },
]);

const LegendContainer = styled.div`
  * {
    color: white !important;
  }
`;

const DateContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  display: flex;
  flex-wrap: nowrap;
`;
const DateSelection = styled.div`
  background-color: #2e2e2e;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  color: #b8b8b8;
  margin-left: 5px;
  font-size: 14px;

  : hover {
    background-color: #343434;
    color: #e8e8e8;
  }
`;
