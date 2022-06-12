<template>
    <div class="container">
        <div class="section">
            <h1 class="title">{{user.congregation.congName}} Locations</h1>
            <div class="buttons">
                <b-button :disabled="loading" icon-left="map" @click="addNewLocation">Add New Location</b-button>
                <b-button :disabled="loading" icon-left="barcode" @click="addNewLocationBySharecode">Add Location by Sharecode</b-button>
            </div>
            <b-field label="Select Location">
                <b-select placeholder="Select a Location" icon="map" :loading="loading" v-model="selectedLocation" @input="locationChange">
                    <option v-for="(location, idx) in locations" v-bind:key="idx" :value="location">{{location.assignmentLocations.name}}</option>
                </b-select>
                <p class="control">
                    <b-button icon-left="pencil" @click="editSelectedLocation(selectedLocation.assignmentLocations)" :disabled="selectedLocation ? false : true" class="button is-primary"></b-button>
                </p>
            </b-field>
            <div v-if="selectedLocation">
                Sharecode: <span class="has-background-grey-lighter ml-4 sharecode">{{selectedLocation.assignmentLocations.shareCode}}</span>
                <div class="columns mt-2">
                    <div class="column">
                        <b-field label="Select Day">
                            <b-select placeholder="Select a Day" icon="calendar" :loading="loading" v-model="selectedLocationDay" @input="daySelected">
                                <option v-for="(day,idx) in formattedLocationDays.days" :value="day" v-bind:key="idx">{{day.name}}</option>
                            </b-select>
                            <p class="control">
                                <b-button :loading="loading" v-if="selectedLocationDay" :icon-left="selectedLocationDay.active ? 'cancel' : 'check' "
                                :class="selectedLocationDay.active ? 'button is-danger' : 'button is-success'"
                                @click="selectedLocationDay.active ? removeDay(selectedLocationDay) : addDay(selectedLocation.assignmentLocations,selectedLocationDay)">
                                    {{selectedLocationDay.active ? 'Remove Day' : 'Add Day'}}
                                </b-button>
                            </p>
                        </b-field>
                        <div v-if="shiftsForDay">
                            <b-field>
                                <b-button icon-left="calendar" type="is-primary" @click="addNewShift(selectedLocationDay)">Add New Shift</b-button>
                            </b-field>
                        </div>
                    </div>
                    <div v-if="shiftsForDay" class="column">
                        <b-table :data="shiftsForDay ? shiftsForDay : []" :loading="loading" default-sort="shiftStart">
                            <b-table-column field="shiftStart" sortable label="Shift Start" v-slot="props">
                                {{getTimeFromDateStamp(props.row.shiftStart)}}
                            </b-table-column>
                            <b-table-column field="shiftEnd" label="Shift End" v-slot="props">
                                {{getTimeFromDateStamp(props.row.shiftEnd)}}
                            </b-table-column>
                            <b-table-column field="slots" label="Slots" centered v-slot="props">
                                {{props.row.slots}}
                            </b-table-column>
                            <b-table-column field="hasKeyPerson" label="Key Person" centered v-slot="props">
                                {{props.row.hasKeyPerson}}
                            </b-table-column>
                            <b-table-column  v-slot="props">
                                <div class="buttons">
                                    <b-button icon-left="pencil" size="is-small" type="is-primary" @click='editShift(props.row)'>Edit</b-button>
                                    <b-button icon-left="cancel" size="is-small" type="is-danger" @click='deleteShift(props.row)'>Delete</b-button>
                                </div>
                            </b-table-column>
                        </b-table>
                    </div>
                </div>
            </div>
        </div>
        <b-modal :active="addLocationModal.open" :full-screen="this.$isMobile()" trap-focus aria-role="dialog" aria-modal :can-cancel="false">
            <CreateEditLocation :isNew="addLocationModal.isNew" :location="addLocationModal.location" 
                @cancel="locationCreateCancel" @locationReturn="locationReturn"></CreateEditLocation>
        </b-modal>
        <b-modal :active="addShiftModal.open" :full-screen="this.$isMobile()" trap-focus aria-role="dialog" aria-modal :can-cancel="false">
            <CreateEditShift :isNew="addShiftModal.isNew" :shift="addShiftModal.shift" :location="addShiftModal.location"
                @cancel="shiftCreateCancel" @shiftReturn="shiftReturn"></CreateEditShift>
        </b-modal>
        <b-loading :active="loading" is-full-page></b-loading>
    </div>
</template>

<script>
import CreateEditLocation from './CreateEditLocation.vue';
import CreateEditShift from './CreateEditShift.vue';
import DayJS from 'dayjs';
import utc from 'dayjs/plugin/utc';
DayJS.extend(utc);

import PMOLib from 'pmo-lib/PMOLib'
let adminLib = new PMOLib.PMO(true);

export default {
    name: "AdminLocations",
    props: {
        user: Object
    },
    metaInfo: {
        title: " :: Locations"
    },
    data() {
        return {
            locations: {},
            loading: false,
            selectedLocation: null,
            locationDays: null,
            selectedLocationDay: null,
            formattedLocationDays: {
                days: []
            },
            shiftsForDay: null,
            addLocationModal: {
                isNew: false,
                location: new PMOLib.Location(),
                open: false
            },
            addShiftModal: {
                isNew: false,
                shift: new PMOLib.Shift(),
                location: new PMOLib.Location(),
                open: false
            }
        }
    },
    methods: {
        refreshLocations() {
            this.loading = true;
            this.selectedLocation = null;

            adminLib.getLocations().then(res => {
                this.locations = res.data;
            }).catch(()=>{
                adminLib.generalError(this, "There was an error loading the locations, please retry again");
            }).finally(()=>{
                this.loading = false
            })
        },
        locationChange() {
            this.loading = true;
            adminLib.getLocationDays(this.selectedLocation.alId).then(res => {
                this.locationDays = res.data;
                this.formattedLocationDays = new PMOLib.DayList();
                this.locationDays.forEach(e => {
                    this.formattedLocationDays.setDayOfWeek(e.dayOfWeek,true,e.id,e.locId);
                })
                this.selectedLocationDay = null;
                this.shiftsForDay = null;
            }).catch(()=>{
                adminLib.generalError(this, "There was an error loading the location days, please try again");
            }).finally( () => {
                this.loading = false;
            })
        },
        daySelected() {
            if (!this.selectedLocationDay.active) { 
                this.shiftsForDay = null;
                return; 
            }
            this.loading = true;
            adminLib.getShiftsForLocationDay(this.selectedLocationDay.locId, this.selectedLocationDay.dId).then(res => {
                this.shiftsForDay = res.data;
            }).catch(() => {
                adminLib.generalError(this, "There was an error loading the shifts for that day, please try again")
            }).finally(()=>{
                this.loading = false;
            })
        },
        getTimeFromDateStamp(dateStamp) {
            let time = DayJS(dateStamp);
            return time.utc().format("h:mma"); 
        },
        addNewLocation() {
            this.addLocationModal.isNew = true;
            this.addLocationModal.location = new PMOLib.Location();
            this.addLocationModal.open = true;
        },
        editSelectedLocation(location) {
            this.addLocationModal.isNew = false;
            this.addLocationModal.location = location;
            this.addLocationModal.open = true;
        },
        addNewLocationBySharecode() {
            this.$buefy.dialog.prompt({
                icon: "barcode",
                hasIcon: true,
                title: 'Add Location via Sharecode',
                message: `Enter Sharecode`,
                inputAttrs: {
                    placeholder: '',
                    maxlength: 10,
                    minlegnth: 10,
                    icon: "barcode"
                },
                trapFocus: true,
                onConfirm: (value) => {
                    adminLib.addLocationByCode(value).then( (res) => {
                        if (res.api.status.error) {
                            this.$buefy.toast.open({
                                message: res.api.status.info,
                                type: 'is-danger',
                                duration: 5000
                            });
                        } else {
                            this.$buefy.toast.open({
                                message: 'Location successfully added',
                                type: 'is-success',
                                duration: 5000
                            });
                            this.refreshLocations();
                        }
                    }).catch(() => {
                        adminLib.generalError(this, "There was an error communication with the server, please try again")
                    });
                }
            });
        },
        locationCreateCancel() {
            this.addLocationModal.open = false;
        },
        locationReturn() {
            this.addLocationModal.open = false;
            this.refreshLocations();
        },
        shiftCreateCancel() {
            this.addShiftModal.open = false;
        },
        shiftReturn() {
            this.addShiftModal.open = false;
            this.daySelected();
        },
        addDay(location, day) {
            this.loading = true;
            adminLib.addLocationDay(location.id,day.dayNum).then(res => {
                if (res.api.status.error) {
                    adminLib.generalError(this, res.api.status.info);
                } else {
                    day.active = true;
                    day.dId = res.data.id;
                    day.locId = location.id;
                    this.$buefy.toast.open({
                        message: 'Day Added',
                        type: 'is-success'
                    });
                    this.daySelected();
                }
            }).catch(() => {
                adminLib.generalError(this, "There was an error communication with the server, please try again")
            }).finally(() => {
                this.loading = false
            });
        },
        removeDay(day) {
            this.$buefy.dialog.confirm({
                    title: 'Deleting location day',
                    message: 'Are you sure you want to <b>delete</b> this day? This action cannot be undone.',
                    confirmText: 'Delete Location Day',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => {
                        this.loading = true;
                        adminLib.removeLocationDay(day.locId,day.dId).then(res=>{
                            if (res.api.status.error) {
                                adminLib.generalError(this, res.api.status.info);
                            } else {
                                day.active = false;
                                this.shiftsForDay = null;
                                this.$buefy.toast.open({
                                    message: 'Day Removed',
                                    type: 'is-danger'
                                });
                            }
                        }).catch(() => {
                            adminLib.generalError(this, "There was an error deleting location day, please make sure <b>all shifts are deleted first!</b>")
                        }).finally(() => {
                            this.loading = false;
                        })
                    }
                })
        },
        addNewShift(day) {
            let shift = new PMOLib.Shift();
            shift.adId = day.dId;
            this.addShiftModal.shift = shift;
            this.addShiftModal.isNew = true;
            this.addShiftModal.open = true;
            this.addShiftModal.location = this.selectedLocation.assignmentLocations;
        },
        editShift(shift) {
            this.addShiftModal.shift = shift;
            this.addShiftModal.isNew = false;
            this.addShiftModal.open = true;
            this.addShiftModal.location = this.selectedLocation.assignmentLocations;
        },
        deleteShift(shift) {
            this.$buefy.dialog.confirm({
                title: 'Deleting shift',
                message: 'Are you sure you want to <b>delete</b> this shift? This action cannot be undone.',
                confirmText: 'Delete shift',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.loading = true;
                    adminLib.removeScheduleShift(this.selectedLocation.assignmentLocations.id, shift.id).then(res=>{
                        if (res.api.status.error) {
                            adminLib.generalError(this, res.api.status.info);
                        } else {
                            this.daySelected();
                            this.$buefy.toast.open({
                                message: 'Shift Removed',
                                type: 'is-danger'
                            });
                        }
                    }).catch(() => {
                        adminLib.generalError(this, "There was an error communication with the server, please try again")
                    }).finally(() => {
                        this.loading = false;
                    })
                }
            })
        }
    },
    mounted() {
        this.refreshLocations();
    },
    components: {
        CreateEditLocation, CreateEditShift
    }
}
</script>

<style>
.sharecode {
    font-family: monospace;
}
</style>
