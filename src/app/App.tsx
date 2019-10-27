import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Record } from '../server/Store';
import Chart from './Chart';

type Props = {};
type State = { data: Record[]; loading: boolean; error: boolean };

export default class App extends PureComponent<Props, State> {
  state = { data: [], loading: false, error: false };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ loading: true, error: false });
    const response = await fetch(process.env.SERVER_URL + '/data/speeds');
    if (response.ok) {
      this.setState({ loading: false, data: await response.json() });
    } else {
      this.setState({ loading: false, error: true });
    }
  };

  renderContents() {
    const { loading, error, data } = this.state;
    if (loading) {
      return <span>Loading...</span>;
    }
    if (error) {
      return <span>Ops we're unable to display results.</span>;
    }
    if (data.length > 2) {
      return <Chart data={data} />;
    } else {
      return <span>Not enough data to display graphs</span>;
    }
  }

  render() {
    return (
      <Container>
        <Title>Speed Tracker</Title>
        {this.renderContents()}
      </Container>
    );
  }
}

const Container = styled.div`
  color: white;
  padding: 10px 40px 0 40px;
`;

const Title = styled.div`
  color: white;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 40px;
`;
