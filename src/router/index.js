import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import UserLogin from '../components/UserLogin.vue'
import UserRegister from '../components/UserRegister.vue'
import PersonDetails from '../views/PersonDetails.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: UserLogin },
  { path: '/register', name: 'Register', component: UserRegister },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/person/:id', name: 'PersonDetails', component: PersonDetails }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
