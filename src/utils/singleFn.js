function getSingle (option){
    this.id = option.id
}
getSingle.prototype.getId = function(){
    return this.id;
}
let singleInstance = (function (){
   let instance;
   return function (option){
       if(!instance){
           instance = new getSingle(option)
       }
       return instance;
   }
})()

export default singleInstance
