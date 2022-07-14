<template>
  <div class="about">
    <h1>This is an about page</h1>
    <com></com>
  </div>
</template>
<script>
import com from "../components/components.vue"
import Single from "../utils/singleOne.js"
import SingleInstance from "../utils/singleFn.js"
import singleDes from "../utils/single.js"
export default {
  name: "about",
  components:{
    com
  },
  data(){
    return {
      single:null,
      singlefn:null,
    }
  },
  created(){
    console.log("about created")
    this.single = Single.getInstanceof({id:2})
    console.log(this.single)
    this.singlefn = SingleInstance({id:2})
    console.log(this.singlefn)
    this.singledes = singleDes.getInstanceof({id:2})
    console.log(this.singledes,"singledes")
    // singleDes.getInstanceof.distroy()
    this.singledes = singleDes.getInstanceof({id:2})
    console.log(this.singledes,"this.singledes")
  },
  mounted(){
    console.log("about mounted")
  }
}
</script>
