const InventoryPayment = artifacts.require("../contracts/InventoryPayment.sol");

// contract("InventoryPayment", (accounts) => {
//   let inventoryPaymentInstance;

//   before(async () => {
//     inventoryPaymentInstance = await InventoryPayment.deployed();
//   });

//   it("should add a product", async () => {
//     await inventoryPaymentInstance.addProduct("Product 1", 100, 10, { from: accounts[0] });
//     const product = await inventoryPaymentInstance.products(1);
//     assert.equal(product.productName, "Product 1", "Product name should be 'Product 1'");
//   });

//   it("should add bank details", async () => {
//     await inventoryPaymentInstance.addUserBankDetails("SBI Bank", 1234567890, 1000000, { from: accounts[0] });
//     const userBankDetails = await inventoryPaymentInstance.userBankDetails(accounts[0]);
//     assert.equal(userBankDetails.bankName, "SBI Bank", "Bank name should be 'SBI Bank'");
//   });

//   it("should place an order", async () => {
//     await inventoryPaymentInstance.placeOrder([1], [5], { from: accounts[0] });
//     const userOrders = await inventoryPaymentInstance.userOrders(accounts[0]);
//     const order = userOrders[0];
//     assert.equal(order.orderNo, 1, "Order number should be 1");
//   });

//   it("should receive an order", async () => {
//     await inventoryPaymentInstance.receiveOrder(1, { from: accounts[0] });
//     const userOrders = await inventoryPaymentInstance.userOrders(accounts[0]);
//     const order = userOrders[0];
//     assert.equal(order.orderStatus, true, "Order status should be true");
//   });

//   it("should pay a supplier for a received order", async () => {
//     await inventoryPaymentInstance.receiveOrder(1, { from: accounts[0] });
//     const initialBalance = await web3.eth.getBalance(accounts[0]);
//     await inventoryPaymentInstance.paySupplier(1, { from: accounts[0] });
//     const finalBalance = await web3.eth.getBalance(accounts[0]);
//     const paymentEvent = await inventoryPaymentInstance.getPastEvents("PaymentSent", {
//       filter: { supplier: accounts[0] }
//     });
//     const paymentAmount = paymentEvent[0].args.amount;
//     assert(finalBalance < initialBalance, "Balance should decrease after payment");
//     assert.equal(paymentAmount, 500, "Payment amount should be 500");
//   });
// });


contract("InventoryPayment", (accounts) => {
  let inventoryPaymentInstance;

  beforeEach(async () => {
    inventoryPaymentInstance = await InventoryPayment.new();
  });

  it("should add a product", async () => {
    await inventoryPaymentInstance.addProduct("Product 1", 100, 10, { from: accounts[0] });
    const product = await inventoryPaymentInstance.products(1);
    assert.equal(product.productName, "Product 1", "Product name should be 'Product 1'");
  });

  it("should place an order", async () => {
    await inventoryPaymentInstance.addUserBankDetails("SBI Bank", 1234567890, 1000, { from: accounts[0] });
    await inventoryPaymentInstance.addProduct("Product 1", 100, 10, { from: accounts[0] });
    await inventoryPaymentInstance.placeOrder([1], [5], { from: accounts[0] });
    const userOrders = await inventoryPaymentInstance.userOrders(accounts[0]);
    const order = userOrders[0];
    assert.equal(order.orderNo, 1, "Order number should be 1");
  });

  it("should receive an order", async () => {
    await inventoryPaymentInstance.receiveOrder(1, { from: accounts[0] });
    const userOrders = await inventoryPaymentInstance.userOrders(accounts[0]);
    const order = userOrders[0];
    assert.equal(order.orderStatus, true, "Order status should be true");
  });

  it("should pay a supplier for a received order", async () => {
    await inventoryPaymentInstance.receiveOrder(1, { from: accounts[0] });
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await inventoryPaymentInstance.paySupplier(1, { from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const paymentEvent = await inventoryPaymentInstance.getPastEvents("PaymentSent", {
      filter: { supplier: accounts[0] }
    });
    const paymentAmount = paymentEvent[0].args.amount;
    assert(finalBalance < initialBalance, "Balance should decrease after payment");
    assert.equal(paymentAmount, 500, "Payment amount should be 500");
  });
});
