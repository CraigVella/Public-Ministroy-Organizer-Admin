<template>
    <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
            <p class="modal-card-title">{{isNew ? 'Create New' : 'Edit'}} Publisher</p>
            <button
                type="button"
                class="delete"
                @click="onCancel"/>
        </header>
        <section class="modal-card-body">
            <b-field label="First Name">
                <b-input
                    v-model="localPublisher.firstName"
                    required>
                </b-input>
            </b-field>
            <b-field label="Last Name">
                <b-input
                    v-model="localPublisher.lastName"
                    required>
                </b-input>
            </b-field>
            <b-field label="Phone">
                <b-input
                    v-model="localPublisher.phone"
                    required>
                </b-input>
            </b-field>
            <b-field label="Email">
                <b-input
                    type="email"
                    v-model="localPublisher.email"
                    required>
                </b-input>
            </b-field>
            <b-field label="Pin">
                <b-input
                    type="password"
                    v-model="localPublisher.pin"
                    password-reveal
                    required>
                </b-input>
            </b-field>
            <b-field label="Extra Account Options">
                <b-switch v-model="localPublisher.disabled" true-value="1" false-value="0">Account Disabled</b-switch>
            </b-field>
            <b-field grouped>
                <b-switch v-model="localPublisher.keyPerson" true-value="Y" false-value="N">Key Person</b-switch>
                <b-switch v-model="localPublisher.congAdmin" true-value="1" false-value="0">Congregation Admin</b-switch>
            </b-field>
        </section>
        <footer class="modal-card-foot">
            <b-button
                label="Cancel"
                @click="onCancel" type='is-danger'/>
            <b-button
                :label="isNew ? 'Create' : 'Update'"
                type="is-primary" @click="submit"/>
        </footer>
        <b-loading :is-full-page="true" v-model="loading"></b-loading>
    </div>
</template>

<script>
import PMOLib from 'pmo-lib/PMOLib'
let adminLib = new PMOLib.PMO(true);

import validator from 'validator';
import libPN from 'libphonenumber-js';

function createOrEditPublisher(create, publisher) {
    if (create) {
        return adminLib.createPublisher(
                publisher.firstName,
                publisher.lastName,
                publisher.email,
                publisher.phone,
                publisher.keyPerson,
                publisher.pin,
                publisher.congAdmin,
                publisher.disabled
            );
    } else {
        return adminLib.updatePublisher(
                publisher.id,
                publisher.firstName,
                publisher.lastName,
                publisher.email,
                publisher.phone,
                publisher.keyPerson,
                publisher.pin,
                publisher.congAdmin,
                publisher.disabled
            );
    }
}

export default {
    name: "CreateEditPublisher",
    props: {
        publisher: Object,
        isNew: Boolean
    },
    data() {
        return {
            localPublisher: Object.assign({},this.publisher),
            loading: false
        }
    },
    methods: {
        onCancel(){
            this.$buefy.dialog.confirm({
                    title: 'Cancel',
                    type: 'is-danger',
                    hasIcon: true,
                    message: 'Are you sure you want to cancel and lose current changes?',
                    onConfirm: () => this.$emit('cancel')
                })
        },
        submit() {
            if (!this.fieldsValid()) return;
            this.loading = true;
            createOrEditPublisher(this.isNew,this.localPublisher).then(res => {
                if (res.api.status.error) {
                    adminLib.generalError(this, res.api.status.info);
                } else {
                    this.$emit('publisherReturn');
                }
            }).catch(() => {
                adminLib.generalError(this, "There was an error processing your request, please try again later");
            }).finally(()=>{
                this.loading = false;
            });
        },
        fieldsValid() {
            if (!validator.isMobilePhone(this.localPublisher.phone)) {
                adminLib.generalError(this, "Phone number must be populated and valid");
                return false;
            } else {
                let pn = libPN(this.localPublisher.phone,'US');
                this.localPublisher.phone = pn.formatNational();
            }
            if (!validator.isEmail(this.localPublisher.email)) {
                adminLib.generalError(this, "Email address must be populated and valid");
                return false;
            }
            if (validator.isEmpty(this.localPublisher.firstName, { ignore_whitespace:true })) {
                adminLib.generalError(this, "First name is a required field");
                return false;
            }
            if (validator.isEmpty(this.localPublisher.lastName, { ignore_whitespace:true })) {
                adminLib.generalError(this, "Last name is a required field");
                return false;
            }
            if (validator.isEmpty(this.localPublisher.pin, { ignore_whitespace:true })) {
                adminLib.generalError(this, "Pin is a required field");
                return false;
            }
            return true;
        }
    }
}
</script>

<style scoped>

</style>
