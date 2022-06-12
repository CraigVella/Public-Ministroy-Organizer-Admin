<template>
    <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
            <p class="modal-card-title">{{isNew ? 'Create New' : 'Edit'}} Shift</p>
            <button
                type="button"
                class="delete"
                @click="onCancel"/>
        </header>
        <section class="modal-card-body">
            <b-field grouped group-multiline>
                <div class="control">
                    <b-field label="Shift Start">
                        <b-timepicker v-model="shiftTimes.shiftStartTime" inline></b-timepicker>
                    </b-field>
                </div>
                <div class="control">
                    <b-field label="Shift End">
                        <b-timepicker v-model="shiftTimes.shiftEndTime" inline></b-timepicker>
                    </b-field>
                </div>
            </b-field>
            <b-field label="Slots">
                <b-numberinput v-model="localShift.slots" min="1"></b-numberinput>
            </b-field>
            <b-field label="Has Key Person">
                <b-switch type="is-success" v-model="localShift.hasKeyPerson" true-value="Y" false-value="N"></b-switch>
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
import PMOLib from '@/lib/PMOLib';
let adminLib = new PMOLib.PMO(true);

import DayJS from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone'
DayJS.extend(utc);
DayJS.extend(tz);

function createEditShift(create, location, shift, shiftTimesObj) {
    shift.shiftStart = DayJS(shiftTimesObj.shiftStartTime).tz("GMT",true).toISOString();
    shift.shiftEnd = DayJS(shiftTimesObj.shiftEndTime).tz("GMT",true).toISOString();
    if (create) {
        return adminLib.addScheduleShift(
            location.id,
            shift.adId,
            shift.shiftStart,
            shift.shiftEnd,
            shift.slots,
            shift.hasKeyPerson
        );
    } else {
        return adminLib.updateScheduleShift(
            location.id,
            shift.id,
            shift.shiftStart,
            shift.shiftEnd,
            shift.slots,
            shift.hasKeyPerson
        );
    }
}

export default {
    name: "CreateEditShift",
    props: {
        isNew: Boolean,
        shift: Object,
        location: Object
    },
    data() {
        return {
            loading: false,
            localShift: Object.assign({},this.shift),
            shiftTimes: {
                shiftStartTime: null,
                shiftEndTime: null
            }
        }
    },
    methods: {
        onCancel() {
            this.$buefy.dialog.confirm({
                title: 'Cancel',
                type: 'is-danger',
                hasIcon: true,
                message: 'Are you sure you want to cancel and lose current changes?',
                onConfirm: () => this.$emit('cancel')
            })
        },
        submit() {
            this.loading = true;
            createEditShift(this.isNew, this.location, this.localShift, this.shiftTimes).then(res => {
                if (res.api.status.error) {
                    adminLib.generalError(this, res.api.status.info);
                } else {
                    this.$emit('shiftReturn');
                }
            }).catch(() => {
                adminLib.generalError(this, "There was an error processing your request, please try again later");
            }).finally(()=>{
                this.loading = false;
            });
        }
    },
    mounted() {
        // Conversion of dates to GMT to Local, we will have to do this when we save back to GMT
        this.shiftTimes.shiftStartTime = DayJS.utc(this.shift.shiftStart).tz(DayJS.tz.guess(),true).toDate();
        this.shiftTimes.shiftEndTime = DayJS.utc(this.shift.shiftEnd).tz(DayJS.tz.guess(),true).toDate();
    }
}
</script>
