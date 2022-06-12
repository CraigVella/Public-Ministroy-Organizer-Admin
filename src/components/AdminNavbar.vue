<template>
    <b-navbar shadow>
        <template #brand>
            <b-navbar-item>
                <img
                    src="@/assets/pmo-nav.png"
                    alt="Public Ministry Organizer"
                >
            </b-navbar-item>
        </template>
        <template #start>
            <b-navbar-item :active="activeItem == 'publishers'" @click="menuSelect('publishers')">
                <b-icon icon='account'></b-icon>&nbsp; Publishers
            </b-navbar-item>
            <b-navbar-item :active="activeItem=='locations'" @click="menuSelect('locations')">
                <b-icon icon='map'></b-icon>&nbsp; Locations
            </b-navbar-item>
        </template>
        <template #end>
            <b-navbar-item @click="menuLogout" tag="div">
                <div class="buttons">
                    <a class="button is-light">
                        Log out
                    </a>
                </div>
            </b-navbar-item>
        </template>
    </b-navbar>
</template>

<script>
export default {
    name: "AdminNavbar",
    data() {
        return {
            activeItem: "publishers"
        }
    },
    methods: {
        menuLogout() {
            this.$emit('logout')
        },
        menuSelect(item) {
            this.activeItem = item;
            this.$emit('menuselect',item);
        }
    }
}
</script>