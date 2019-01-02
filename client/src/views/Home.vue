<template>
  <el-container>
    <el-header></el-header>
    <el-main>
      <div class="container-center">
        <h2>Welcome!</h2>
        <div>Enter your email address</div>
        <div v-if="error" class="error">{{error}}</div>

        <el-form ref="form" :model="form" @submit.native.prevent="capture">
          <el-form-item>
            <label>Email</label>
            <el-input v-model="form.email" placeholder="Email"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="capture">Create</el-button>
          </el-form-item>
        </el-form>

        <span>Already have an account?</span>
        <router-link :to="{name: 'login'}" class="link">Login</router-link>

        <div v-if="submitted">
          <div>Account Created!</div>
          <div>Please check your email.</div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { CaptureEmail } from "@/constants/query.gql";
import { validateEmail } from "@/helpers/helpers";

export default {
  data() {
    return {
      submitted: false,
      error: false,
      form: {
        email: ""
      }
    };
  },
  methods: {
    async capture() {
      const { email } = this.form;

      if (!email || !validateEmail(email)) {
        this.error = "Please enter valid email";
        return;
      }

      await this.$apollo
        .mutate({
          mutation: CaptureEmail,
          variables: { email }
        })
        .then(({ data }) => {
          this.submitted = true;
          this.error = false;
          console.log(data.captureEmail);
        })
        .catch(error => {
          if (error.graphQLErrors && error.graphQLErrors.length >= 1) {
            this.error = error.graphQLErrors[0].message;
          } else {
            this.error = "There was an error";
          }
          console.log(error);
        });
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

