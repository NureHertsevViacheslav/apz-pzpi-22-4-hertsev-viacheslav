import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50,
  duration: '10s',
};

export default function () {
  let res = http.get('http://localhost:3000/api/rooms');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
