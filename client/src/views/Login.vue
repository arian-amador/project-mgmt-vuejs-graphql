<template>
  <el-container>
    <el-header></el-header>
    <el-main>
      <div class="container-center">
        <h2>Log In</h2>
        <div v-if="error" class="error">{{ error }}</div>

        <el-form ref="form" :model="form" @submit.native.prevent="login">
          <el-form-item>
            <label>Email</label>
            <el-input v-model="form.email" placeholder="Email"></el-input>

            <label>Password</label>
            <el-input v-model="form.password" placeholder="Password" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="login">Login</el-button>
          </el-form-item>
        </el-form>

        <span>Don't have an account?</span>
        <router-link :to="{name: 'home'}" class="link">Create an account</router-link>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { Login } from "@/constants/query.gql";

export default {
  data() {
    return {
      error: false,
      form: {
        email: "",
        password: ""
      }
    };
  },
  methods: {
    login() {
      this.$apollo.provider.clients.defaultClient.cache.reset();

      const { email, password } = this.form;
      if (!(email || password)) {
        this.error = "Please fill all required fields";
        return;
      }

      this.$apollo
        .mutate({
          mutation: Login,
          variables: {
            email,
            password
          }
        })
        .then(async data => {
          const login = data.data.login;
          const id = login.user.id;
          const token = login.token;
          this.saveUserData(id, token);
          this.$router.push("workspace");
        })
        .catch(error => {
          this.error = "Invalid email or password";
          console.log(error);
        });
    },
    saveUserData(id, token) {
      localStorage.setItem("user-id", id);
      localStorage.setItem("user-token", token);
      this.$root.$data.userId = localStorage.getItem("user-id");
    }
  }
};
</script>

<style lang="scss" scoped>
.el-button {
  width: 100%;
}
</style>
