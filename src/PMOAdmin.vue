<template>
  <div id="pmo-admin">
    <b-loading :active="loading"></b-loading>
    <PageLogin v-if="!logged_in" v-on:logged-in="loginComplete"></PageLogin>
    <div v-if="logged_in">
      <AdminNavbar v-on:logout="logout" v-on:menuselect="menuSelect"></AdminNavbar>
      <AdminPublishers v-if="pageSelect === 'publishers'" :user='userObj'></AdminPublishers>
      <AdminLocations v-if="pageSelect === 'locations'" :user="userObj"></AdminLocations>
    </div>
    <PageFooter></PageFooter>
  </div>
</template>

<script>
import PageLogin from './components/PageLogin.vue'
import PageFooter from './components/PageFooter.vue'
import AdminNavbar from './components/AdminNavbar.vue'
import AdminPublishers from './components/AdminPublishers.vue'
import AdminLocations from './components/AdminLocations.vue'

import PMOLib from 'pmo-lib/PMOLib'
let adminLib = new PMOLib.PMO(true);

export default {
  name: 'PMOAdmin',
  metaInfo: {
    titleTemplate: "Public Ministry Organizer Admin%s"
  },
  components: {
    PageLogin, PageFooter, AdminNavbar, AdminLocations, AdminPublishers
  }, 
  data() {
    return {
      logged_in: false,
      loading: true,
      userObj: {
        congregation: {
          congName: ''
        }
      },
      pageSelect: 'publishers'
    }
  },
  methods: {
    menuSelect(item) {
      this.pageSelect = item;
    },
    loginComplete() {
      this.loading = true;
      adminLib.getUserObject().then(r => {
        this.loading = false;
        this.userObj = r.data.api.user;
        this.logged_in = true;
      }).catch( () => {
        adminLib.generalError(this, 'There was an error loading PMO Admin - Please try again later');
      });
    },
    logout() {
      this.loading = true;
      adminLib.logout(true).then(() => {
        this.userObj = {};
        this.loading = false;
        this.logged_in = false;
      }).catch( () => {
        adminLib.generalError(this,'There was an error logging out - Please try again later');
      });
    }
  },
  mounted() {
    adminLib.isLoggedIn().then( r=> {
      this.logged_in = r;
      if (this.logged_in) {
        this.loginComplete();
      } else {
        this.loading = false;
      }
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
