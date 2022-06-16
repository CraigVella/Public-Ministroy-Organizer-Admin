<template>
    <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
            <p class="modal-card-title">{{isNew ? 'Create New' : 'Edit'}} Location</p>
            <button
                type="button"
                class="delete"
                @click="onCancel"/>
        </header>
        <section class="modal-card-body">
            <b-field label="Location Name">
                <b-input
                    v-model="localLocation.name"
                    required>
                </b-input>
            </b-field>
            <b-field label="Address">
                <b-input
                    v-model="localLocation.address">
                </b-input>
            </b-field>
            <b-field label="City">
                <b-input
                    v-model="localLocation.city">
                </b-input>
            </b-field>
            <b-field label="State">
                <b-input
                    v-model="localLocation.state">
                </b-input>
            </b-field>
            <b-field label="Zip">
                <b-input
                    v-model="localLocation.zip">
                </b-input>
            </b-field>
        </section>
        <footer class="modal-card-foot">
            <b-button
                label="Cancel"
                @click="onCancel" type='is-danger'/>
            <b-button
                :label="isNew ? 'Create' : 'Update'"
                type="is-primary" @click="submit"/>
            <b-button v-if="!isNew"
                label="Remove Location"
                type="is-warning" @click="remove"/>
        </footer>
        <b-loading :is-full-page="true" v-model="loading"></b-loading>
    </div>
</template>

<script>
import PMOLib from 'pmo-lib/PMOLib'
let adminLib = new PMOLib.PMO(true);

import validator from 'validator';

function createOrEditLocation(create, location) {
    if (create) {
        return adminLib.createLocation(
            location.name,
            location.address,
            location.city,
            location.state,
            location.state
        )
    } else {
        return adminLib.updateLocation(
            location.id,
            location.name,
            location.address,
            location.city,
            location.state,
            location.zip
        )
    }
}

export default {
    name: "CreateEditLocation",
    props: {
        location: Object,
        isNew: Boolean
    },
    data() {
        return {
            localLocation: Object.assign({},this.location),
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
        validate() {
            if (validator.isEmpty(this.localLocation.name,{ ignore_whitespace:true })) {
                adminLib.generalError(this,"Location name is a required field and cannot be left empty");
                return false;
            }
            return true;
        },
        submit() {
            if (!this.validate()) return;
            this.loading = true;
            createOrEditLocation(this.isNew, this.localLocation).then(res => {
                if (res.api.status.error) {
                    adminLib.generalError(this, res.api.status.info);
                } else {
                    this.$emit('locationReturn');
                }
            }).catch(() => {
                adminLib.generalError(this, "There was an error processing your request, please try again later");
            }).finally(()=>{
                this.loading = false;
            });
        },
        remove() {
            this.$buefy.dialog.confirm({
                    title: 'Remove Location',
                    type: 'is-danger',
                    hasIcon: true,
                    message: 'Are you sure you want to <b>remove</b> this location from your congregation?<br /><br /> \
                        <p class="is-size-7">Please write down the sharecode <b>'+ this.localLocation.shareCode +'</b> if you ever need to restore it</p>',
                    onConfirm: () => {
                        adminLib.removeLocation(this.localLocation.id).then(res=>{
                            if (res.api.status.error) {
                                adminLib.generalError(this, res.api.status.info);
                            } else {
                                this.$emit('locationReturn');
                            }
                        }).catch(() => {
                            adminLib.generalError(this, "There was an error processing your request, please try again later");
                        })
                    }
                })
        }
    }
}
</script>

<style scoped>

</style>
