<template>
    <div class="container">
        <div class="section">
            <h1 class="title">{{user.congregation.congName}} Publishers</h1>
            <b-button @click="createNewPub" :disabled="loadingData" class='mb-5' icon-left="account">Add New Publisher</b-button>
            <b-table :loading="loadingData" :data="publishers" striped :show-detail-icon="false" detailed detail-key="id"
            :default-sort="['lastName', 'asc']">
                <b-table-column field="firstName" label="First Name" sortable v-slot="props">
                    <p :class="props.row.congAdmin === 1 ? 'has-text-weight-bold has-text-success' : ''">{{props.row.firstName}}</p>
                </b-table-column>
                <b-table-column field="lastName" label="Last Name" sortable v-slot="props">
                    <p :class="props.row.congAdmin === 1 ? 'has-text-weight-bold has-text-success' : ''">{{props.row.lastName}}</p>
                </b-table-column>
                <b-table-column field="phone" label="Phone" v-slot="props">
                    <a :href="getPhoneURI(props.row.phone)">{{props.row.phone}}</a>
                </b-table-column>
                <b-table-column field="email" label="Email" v-slot="props">
                    <a :href="'mailto:'+props.row.email">{{props.row.email}}</a>
                </b-table-column>
                <b-table-column field="keyPerson" label="Key Person" centered sortable v-slot="props">
                    <b-icon icon="key" :type="props.row.keyPerson==='N' ? 'is-danger' : 'is-success'"></b-icon>
                </b-table-column>
                <b-table-column field="disabled" label="Active" centered sortable v-slot="props">
                    <b-icon :icon="props.row.disabled ? 'account-off' : 'account'" :type="props.row.disabled ? 'is-danger' : 'is-success'"></b-icon>
                </b-table-column>
                <b-table-column centered v-slot="props">
                    <b-field grouped group-multiline>
                        <b-button class="control" size="is-small" type="is-primary" icon-left='pencil' @click='editPub(props.row)'>Edit</b-button>
                        <b-button class="control" size="is-small" type="is-primary" icon-left='account-details' @click='props.toggleDetails(props.row)'></b-button>
                        <b-button class="control" size="is-small" type="is-danger" icon-left='cancel' @click='deletePublisher(props.row)'></b-button>
                    </b-field>
                </b-table-column>
                <template #detail="props">
                    <div class="content">
                        <div v-if="props.row.lastLogin === undefined">
                            No Additional Details
                        </div>
                        <div v-else>
                            <b>Last Login:</b> <i>{{formatDateText(props.row.lastLogin.lastLogin,'MMMM D, YYYY h:mma')}}</i><br />
                            <b>From IP Address:</b> <i>{{props.row.lastLogin.lastIP}}</i>
                        </div>
                    </div>
                </template>
            </b-table>
        </div>
        <b-modal v-model="createEditProps.open"  trap-focus aria-role="dialog" 
            aria-modal :can-cancel="false" :full-screen="this.$isMobile()">
            <CreateEditPublisher :publisher="createEditProps.pub" :isNew="createEditProps.createNew"
            @publisherReturn="onPublisherReturn" @cancel="createEditProps.open = false"></CreateEditPublisher>
        </b-modal>
    </div>
</template>

<script>
import CreateEditPublisher from './CreateEditPublisher.vue';

import PMOLib from 'pmo-lib/PMOLib'
let adminLib = new PMOLib.PMO(true);

import libPN from 'libphonenumber-js'
import DayJS from 'dayjs';

export default {
    name: "AdminPublishers",
    metaInfo: {
        title: " :: Publishers"
    },
    data() {
        return {
            loadingData: false,
            publishers: [],
            createEditProps: {
                open: false,
                createNew: false,
                pub: {}
            }
        }
    },
    props: {
        user: Object
    },
    mounted() {
        this.reloadPublishers();
    },
    methods: {
        reloadPublishers() {
            this.loadingData = true;
            adminLib.getPublishers().then (r => {
                this.publishers = r.data;
            }).catch( () => {
                adminLib.generalError(this,"There was an error loading publishers, please try again later");
            }).finally(() => {
                this.loadingData = false;
            })
        },
        editPub(pub) {
            this.createEditProps.createNew = false;
            this.createEditProps.pub = pub;
            this.createEditProps.open = true;
        },
        createNewPub() {
            this.createEditProps.createNew = true;
            this.createEditProps.open = true;
            this.createEditProps.pub = new PMOLib.Publisher()
        },
        onPublisherReturn() {
            this.createEditProps.open = false;
            this.reloadPublishers();
        },
        getPhoneURI(phone) {
            const returnPhone = libPN(phone,'US');
            return returnPhone.getURI();
        },
        formatDateText(date, format) {
            return DayJS(date).format(format).toString();
        },
        deletePublisher(row) {
            this.$buefy.dialog.confirm({
                    title: 'Deleting publisher',
                    message: 'Are you sure you want to <b>delete <i>' + row.firstName + ' ' + row.lastName + '</i></b>? This action cannot be undone and will <b>unschedule</b> them from all past and future shifts.',
                    confirmText: 'Delete Publisher',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => {
                        this.loadingData = true;
                        adminLib.deletePublisher(row.id).then(r=>{
                            if (r.api.status.error) {
                                adminLib.generalError(this,r.api.status.info);
                            } else {
                                this.$buefy.toast.open({
                                    message: "Publisher Deleted!",
                                    type: 'is-danger'
                                })
                            }
                        }).catch(()=>{
                            adminLib.generalError(this, "There was an error deleting this publisher, please try again later");
                        }).finally(()=>{
                            this.loadingData = false;
                            this.reloadPublishers();
                        })
                    }
                })
        }
    },
    components: {
        CreateEditPublisher
    }
}
</script>
