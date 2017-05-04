import { Global } from './app/global';
import Vue from 'vue';
import axios from 'axios';
import router from './app/routes';
import store from './app/store';

window.axios = axios;
window.router = router;
window.store = store;
import vueFilters from './app/filters';

const api = process.env.NODE_ENV != "production" ?
      require('./dev/api') : require('./app/api');

const Dev = process.env.NODE_ENV != "production" ?
      require('./dev/dev') : require('./dev/empty');