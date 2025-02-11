import '@mantine/core/styles.css';
import { Button, Card, Center, Divider, Grid, Group, Table, Title } from '@mantine/core';
import { Alert, DatePicker, message } from "antd";
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';



function App() {
  const [Ip, Setip] = useState([]);
  const [Hourly, SetHourly] = useState([]);
  const [topef, settopef] = useState([]);
  const [topso, settopso] = useState([]);
  const [date, setdate] = useState('');
  const [topdate, settopdate] = useState('');


  const handleDateChange = (date) => {
    setdate(date); // `dateString` contains the formatted date
  };
  const handleTopDateChange = (date) => {
    settopdate(date);
  };


  const Analayzealllogs = async () => {
    const CreationDate = dayjs(date).format('YYYY-MM-DD'); // for input.
    const res = await fetch("http://localhost:8000/analyze-logs/" + CreationDate, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const Result = await res.json();
    if (res.status === 200) {
      Setip(Result.sortedIPs);
      SetHourly(Result.sortedHours);
      setdate('');
      return
    } else {
      message.error('No Data Found');
    }
  }

  const Get_Top_85 = async () => {

    const CreationDate = dayjs(topdate).format('YYYY-MM-DD'); // for input.
    const res = await fetch("http://localhost:8000/get-top-ef-ips/" + CreationDate, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const Result = await res.json();
    if (res.status === 200) {
      settopef(Result.topIPs);
      settopdate('');
    } else {
      message.error('No Data Found');
    }
  }

  const Get_Top_70 = async () => {

    const CreationDate = dayjs(topdate).format('YYYY-MM-DD'); // for input.
    const res = await fetch("http://localhost:8000/get-top-so-ips/" + CreationDate, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const Result = await res.json();
    if (res.status === 200) {
      settopso(Result.topHours);
      settopdate('');
    } else {
      message.error('No Data Found');
    }
  }

  function Fetched_both_top_IPs() {
    Get_Top_85();
    Get_Top_70();
  }

  useEffect(() => {
    const AnalayzeLogs = async () => {
      const datestamps = new Date().toISOString().split('T')[0];
      //console.log('Date', datestamps);

      const res = await fetch("http://localhost:8000/analyze-logs/" + datestamps, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const Result = await res.json();
      //console.log(Result);
      if (res.status === 200) {
        Setip(Result.sortedIPs);
        SetHourly(Result.sortedHours);
      }
    }
    const Get_Top_85 = async () => {
      const datestamps = new Date().toISOString().split('T')[0];
      const res = await fetch("http://localhost:8000/get-top-ef-ips/" + datestamps, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const Result = await res.json();
      if (res.status === 200) {
        settopef(Result.topIPs);
      }
    }
    const Get_Top_70 = async () => {
      const datestamps = new Date().toISOString().split('T')[0];
      const res = await fetch("http://localhost:8000/get-top-so-ips/" + datestamps, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const Result = await res.json();
      if (res.status === 200) {
        settopso(Result.topHours);
      }
    }
    AnalayzeLogs();
    Get_Top_85();
    Get_Top_70();
  }, [])

  return (
    <>
      <Center mt={'sm'}>
        <Title size="h1" c={'dimmed'}>-- Log Parser --</Title>
      </Center>


      <Card mt={'lg'}>
        <Group justify='flex-end'>
          <DatePicker onChange={handleDateChange} value={date} />
          <Button onClick={Analayzealllogs} color='lime' size='md'>Fetch IP</Button>
        </Group>
        <Grid>
          <Grid.Col span={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <Card shadow='md'>
              <Alert message={`Distinct IP addresses fetched current date. ${new Date().toISOString().split('T')[0]}`} showIcon />
              <Table mt={'sm'}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>IP Address</Table.Th>
                    <Table.Th>Occurrences</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{Ip.map((ele, idx) => {
                  return (
                    <Table.Tr key={idx}>
                      <Table.Td>{ele[0]}</Table.Td>
                      <Table.Td>{ele[1]}</Table.Td>
                    </Table.Tr>
                  )
                })}</Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <Card shadow='md'>
              <Alert message={`Hourly traffic fetched current date. ${new Date().toISOString().split('T')[0]}`} showIcon />
              <Table mt={'sm'}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>In 24 Hours Format</Table.Th>
                    <Table.Th>Visitors</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{Hourly.map((ele, idx) => {
                  return (
                    <Table.Tr key={idx}>
                      <Table.Td>{ele[0]}</Table.Td>
                      <Table.Td>{ele[1]}</Table.Td>
                    </Table.Tr>
                  )
                })}</Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>
        </Grid>
      </Card>

      <Divider variant='dashed' />

      <Card mt={'lg'}>
        <Group justify='flex-end'>
          <DatePicker onChange={handleTopDateChange} value={topdate} />
          <Button onClick={Fetched_both_top_IPs} color='lime' size='md'>Fetch Top IP</Button>
        </Group>
        <Grid>
          <Grid.Col span={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <Card shadow='md'>
              <Alert message={`IP addresses that contribute to 85%  fetched current date. ${new Date().toISOString().split('T')[0]}`} showIcon />
              <Table mt={'sm'}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>IP Address</Table.Th>
                    <Table.Th>Occurrences</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{topef.map((ele, idx) => {
                  return (
                    <Table.Tr key={idx}>
                      <Table.Td>{ele[0]}</Table.Td>
                      <Table.Td>{ele[1]}</Table.Td>
                    </Table.Tr>
                  )
                })}</Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <Card shadow='md'>
              <Alert message={`Hours contributing to the 70%  fetched current date. ${new Date().toISOString().split('T')[0]}`} showIcon />
              <Table mt={'sm'}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>24 Hour Format</Table.Th>
                    <Table.Th>Visitors</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{topso.map((ele, idx) => {
                  return (
                    <Table.Tr key={idx}>
                      <Table.Td>{ele[0]}</Table.Td>
                      <Table.Td>{ele[1]}</Table.Td>
                    </Table.Tr>
                  )
                })}</Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>
        </Grid>
      </Card>
      
    </>
  );
}

export default App;
