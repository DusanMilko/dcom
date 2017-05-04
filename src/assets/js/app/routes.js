import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const HomePage = {
  template:
  `
  <div>
    <router-link to="/">Go to home</router-link>
    <router-link to="/subpage">Go to subpage</router-link>

    HomePage
  </div>
  `
};
const SubPage = {
  template:
  `
  <div>
    <router-link to="/">Go to home</router-link>
    <router-link to="/subpage">Go to subpage</router-link>

    SubPage
  </div>
  `
};

const routes = [
  { path: '/', component: HomePage },
  { path: '/subpage', component: SubPage }
];

const router = new VueRouter({
  mode: 'history',
  linkActiveClass: 'is-active',
  routes // short for routes: routes
});

export default router;