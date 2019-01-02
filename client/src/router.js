import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Signup from './views/Signup.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Projects - Home' },
    },
    {
      path: '/signup/:id',
      name: 'signup',
      component: Signup,
      meta: { title: 'Projects - Sign Up' },
    },
  ],
});

router.afterEach((to, from) => {
  document.title = to.meta.title;
});

export default router;
