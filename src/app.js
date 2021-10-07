const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const Web3=require("web3");
const Bank=require("../build/contracts/Payment.json");
const Provider=require("@truffle/hdwallet-provider");


const port=process.env.PORT || 8000;


const viewPath=path.join(__dirname,"../templates/views");
const partialPath=path.join(__dirname,"../templates/partials");

app.use(express.urlencoded({extended:false}));

app.set("view engine","hbs");
app.set("views",viewPath);
hbs.registerPartials(partialPath);

let web3;
let accounts;
let nId;
let bankContract;
init=async(key)=>{
    try {
        let provider=new Provider(key,
        "https://rinkeby.infura.io/v3/7881c445fae647d98e1f6aa3d92e8177");
        web3=await new Web3(provider);
        accounts=await web3.eth.getAccounts();
        console.log(accounts);
        nId=await web3.eth.net.getId();
        console.log(nId);
        bankContract=await new web3.eth.Contract(Bank.abi,Bank.networks[nId] && Bank.networks[nId].address);
    } catch (error) {
        console.log("web3 error");
        console.log(error);
    }
};


app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/logs",async(req,res)=>{
   const ress=await bankContract.getPastEvents("Bal",{
       fromBlock:0
   });
   console.log(ress.length);
});

app.post("/profile",async(req,res)=>{
    try {
        await init(req.body.key);
       let ress=await  bankContract.methods.paymentData(accounts[0]).call();
       console.log(ress.totalAmount);
        res.render("profile",{
            bal:web3.utils.fromWei(ress.totalAmount,"ether")
        })
    } catch (error) {
        console.log("private key error ");
        console.log(error);
        res.send("something went wrong with private key")
    }
})

app.post("/send",async(req,res)=>{
    try {
      let ress= await  bankContract.methods.sendToContract().send({
            from:accounts[0],
            value:req.body.money,
            gas:210000
        });
        console.log(ress.events.Bal.returnValues.value);
        res.render("profile",{
            bal:web3.utils.fromWei(ress.events.Bal.returnValues.value,"ether")
        });
        // let re=await bankContract.methods.getContractBalance().call();
        // console.log(re);
    } catch (error) {
        console.log("sending error");
        console.log(error);
    }
});

app.post("/wdraw",async(req,res)=>{
    try {
        let ress=await bankContract.methods.withdraw(req.body.money).send({
            from:accounts[0]
        });
        console.log(ress.events.Bal.returnValues.value);
        res.render("profile",{
            bal:web3.utils.fromWei(ress.events.Bal.returnValues.value,"ether")
        })
    } catch (error) {
        console.log("withdraw error");
        console.log(error)
    }
});






app.listen(port,()=>{
    console.log("listenning at "+port);
})