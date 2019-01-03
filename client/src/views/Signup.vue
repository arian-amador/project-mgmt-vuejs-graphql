<template>
  <el-container>
    <el-header></el-header>
    <el-main>
      <div class="container-center">
        <h2>Welcome! Finish setting up your account</h2>

        <div v-if="error" class="error">{{error}}</div>

        <el-form ref="form" :model="form" @submit.native.prevent="signup">
          <el-form-item>
            <label>First Name</label>
            <el-input v-model="form.firstName" placeholder="First name"></el-input>

            <label>Last Name</label>
            <el-input v-model="form.lastName" placeholder="Last name"></el-input>

            <label>Password</label>
            <el-input v-model="form.password" placeholder="Password" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="signup">Complete</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { SignUp } from "@/constants/query.gql";

export default {
  data() {
    return {
      error: false,
      form: {
        firstName: "",
        lastName: "",
        password: ""
      }
    };
  },
  methods: {
    async signup() {
      this.$apollo.provider.clients.defaultClient.cache.reset();

      const { firstName, lastName, password } = this.form;
      if (!(firstName && lastName && password)) {
        this.error = "Please complete the form";
        return;
      }

      await this.$apollo
        .mutate({
          mutation: SignUp,
          variables: {
            id: this.$route.params.id,
            firstName,
            lastName,
            password
          }
        })
        .then(({ data: { signUp } }) => {
          const id = signUp.user.id;
          const token = signUp.token;
          this.saveUserData(id, token);
          this.$router.push({ name: "workspace" });
        })
        .catch(error => {
          this.error = "Error finishing up signup";
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
.error {
  padding-top: 10px;
}
</style>
