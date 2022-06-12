<template>
    <div class="section">
        <div class="container" style="max-width: 600px;">
            <div class="card">
                <header class="card-header">
                    <div class="media-content">
                        <p class="card-header-title is-justify-content-center">
                            <img src="@/assets/pmo-condensed.png"/>
                        </p>
                        <p class="card-header-title is-justify-content-center">Admin Login Portal</p>
                    </div>
                </header>
                <div class="card-content">
                    <div class="content">
                        <b-field label="Email">
                            <b-input type="email" v-on:keyup.native.enter="login" :disabled="loading" placeholder="my-email@gmail.com" icon="email" v-model="email" ></b-input>
                        </b-field>
                        <b-field label="Pin">
                            <b-input type="password" v-on:keyup.native.enter="login" :disabled="loading" password-reveal icon='form-textbox-password' v-model="pin"></b-input>
                        </b-field>
                        <p v-if="hasError" class="has-text-centered login-error">{{errorMessage}}</p>
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" @click="login" class="card-footer-item">Login</a>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
import PMOLib from 'pmo-lib/PMOLib'
let adminLib = new PMOLib.PMO(true);

export default {
    name: "PageLogin",
    data() {
        return {
            email: "",
            pin: "",
            errorMessage: "",
            hasError: false,
            loading: false
        }
    },
    methods: {
        login() {
            if (this.email.length < 6 || this.pin.length === 0) {
                this.hasError = true;
                this.errorMessage = "Invalid input"
                return;
            }
            if (this.loading) return;
            this.hasError = false;
            this.loading = true;
            adminLib.loginUser(this.email, this.pin).then(data=>{
                this.loading = false;
                if (data.api.status.error) {
                    this.hasError = true;
                    this.errorMessage = data.api.status.info;
                } else {
                    if (1 === data.api.user.congAdmin){
                        this.$emit('logged-in');
                    } else {
                        this.hasError = true;
                        this.errorMessage = "This user is not a congregation admin";
                    }
                }
            }).catch(()=>{
                this.loading = false;
                adminLib.generalError(this, "There was an error processing your login request, please try again");
            });
        }
    }, 
    metaInfo: {
        title: " :: Login"
    }
}
</script>

<style scoped lang="scss">
@import "@/scss/custom.scss";
.login-error {
    color: $danger;
}
</style>
