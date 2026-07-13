import {createRouter, createWebHistory} from 'vue-router'

const routes = [
  {path: '/',                 component: () => import('./pages/home.vue')},
  {path: '/team',             component: () => import('./pages/team.vue')},
  {path: '/team/:id',         component: () => import('./pages/team-profile.vue'), props: true},
  {path: '/donor',            component: () => import('./pages/donor.vue')},
  {path: '/donor/id/:id',     component: () => import('./pages/donor-profile.vue'), props: true},
  {path: '/donor/name/:name', component: () => import('./pages/donor-profile.vue'), props: true},
  {path: '/donor/:id',        redirect: to => /^\d+$/.test(to.params.id)
                                ? '/donor/id/' + to.params.id
                                : '/donor/name/' + to.params.id},
  {path: '/project',          component: () => import('./pages/project.vue')},
  {path: '/project/:id',      component: () => import('./pages/project-profile.vue'), props: true},
  {path: '/os',               component: () => import('./pages/os.vue')},
  {path: '/server',           component: () => import('./pages/server.vue')},
  {path: '/utils',            component: () => import('./pages/utils.vue')},
  {path: '/credit-log',       component: () => import('./pages/credit-log.vue')},
  {path: '/:pathMatch(.*)*',  component: () => import('./pages/not-found.vue')}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {return {top: 0}}
})

export default router
