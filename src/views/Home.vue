<template>
  <div class="home">
    <h1>home</h1>
  </div>
</template>

<script>
// @ is an alias to /src
import Single from "../utils/singleOne.js"
import SingleInstance from "../utils/singleFn.js"
import singleDes from "../utils/single.js"
export default {
  name: 'Home',
  data(){
    return {
      single:null,
      singlefn:null,
      singledes:null,
    }
  },
  created(){
    this.single = Single.getInstanceof({id:1})
    console.log(this.single, 111)
    this.singlefn = SingleInstance({id:1})
    console.log(this.singlefn,"this.singlefn")
    this.singledes = singleDes.getInstanceof({id:1})
    console.log(this.singledes,"singledes")
  }
}
</script>
