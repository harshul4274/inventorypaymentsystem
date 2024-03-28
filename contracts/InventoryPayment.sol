// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract InventoryPayment {
    struct Product {
        uint256 productId;
        string productName;
        uint256 productPrice;
        uint256 productQty;
    }

    struct Order {
        uint256 orderNo;
        uint256 orderDate;
        uint256 orderTotalAmount;
        string orderStatus;
        uint256 supplierId;
        mapping(uint256 => OrderDetail) orderDetails;
    }

    struct OrderDetail {
        uint256 productId;
        uint256 productQtyOrder;
        uint256 productQtyReceived;
    }

    struct Supplier {
        uint256 supplierId;
        string supplierName;
        string supplierNumber;
        SupplierBank supplierBank;
    }

    struct SupplierBank {
        string bankName;
        string sortCode;
        uint256 accountNumber;
    }

    struct Bank {
        uint256 id;
        string bankName;
        uint256 bankAccountNumber;
        uint256 backupAmount;
    }

    uint256 public productCount;
    uint256 public bankCount;
    uint256 public orderCount;
    uint256 public supplierCount;

    mapping(uint256 => Product) public products;
    mapping(address => Order[]) public userOrders;
    mapping(uint256 => Bank) public userBankDetails;
    mapping(uint256 => SupplierBank) public supplierBankDetails;
    mapping(uint256 => Supplier) public suppliers;
    uint256[] public activeProductIds;
    uint256[] public activeSupplierIds;

    event OrderPlaced(uint256 indexed orderNo, address indexed user);

    event BankAdded(uint256 indexed bankId);
    event BankUpdated(uint256 indexed bankId);
    event BankDeleted(uint256 indexed bankId);

    event ProductAdded(uint256 indexed productId);
    event ProductUpdated(uint256 indexed productId);
    event ProductDeleted(uint256 indexed productId);
    event PaymentSent(
        uint256 indexed orderNo,
        address indexed supplier,
        uint256 amount
    );

    event SupplierAdded(uint256 indexed supId);
    event SupplierUpdated(uint256 indexed supId);
    event SupplierDeleted(uint256 indexed supId);

    // Function to add supplier details
    function addSupplier(
        string memory _supplierName,
        string memory _supplierNumber,
        string memory _bankName,
        string memory _sortCode,
        uint256 _bankAccountNumber
    ) external {
        require(
            bytes(_supplierName).length > 0,
            "Supplier name cannot be empty"
        );
        require(
            bytes(_supplierNumber).length > 0,
            "Supplier number cannot be empty"
        );
        require(bytes(_bankName).length > 0, "Bank name cannot be empty");
        require(bytes(_sortCode).length > 0, "Sort code cannot be empty");
        require(_bankAccountNumber != 0, "Bank account number cannot be zero");

        supplierCount++;
        suppliers[supplierCount] = Supplier(
            supplierCount,
            _supplierName,
            _supplierNumber,
            SupplierBank(_bankName, _sortCode, _bankAccountNumber)
        );
        activeSupplierIds.push(supplierCount);

        emit SupplierAdded(supplierCount);
    }

    // Function to get all supplier details
    function getAllSuppliersDetails()
        external
        view
        returns (Supplier[] memory)
    {
        Supplier[] memory allSuppliers = new Supplier[](supplierCount);
        for (uint256 i = 1; i <= supplierCount; i++) {
            allSuppliers[i - 1] = suppliers[i];
        }
        return allSuppliers;
    }

    // Function to update supplier details
    function updateSupplier(
        uint256 _supplierId,
        string memory _newName,
        string memory _newNumber,
        string memory _newBankName,
        string memory _newSortCode,
        uint256 _newAccountNumber
    ) external {
        require(
            _supplierId <= supplierCount && _supplierId > 0,
            "Invalid supplier ID"
        );
        Supplier storage supplier = suppliers[_supplierId];
        supplier.supplierName = _newName;
        supplier.supplierNumber = _newNumber;
        supplier.supplierBank.bankName = _newBankName;
        supplier.supplierBank.sortCode = _newSortCode;
        supplier.supplierBank.accountNumber = _newAccountNumber;
        emit SupplierUpdated(_supplierId);
    }

    // Function to delete a supplier
    function deleteSupplier(uint256 _supplierId) external {
        require(
            _supplierId <= supplierCount && _supplierId > 0,
            "Invalid supplier ID"
        );
        delete suppliers[_supplierId];
        emit SupplierDeleted(_supplierId);

        // Remove the supplier ID from activeSupplierIds array
        for (uint256 i = 0; i < activeSupplierIds.length; i++) {
            if (activeSupplierIds[i] == _supplierId) {
                activeSupplierIds[i] = activeSupplierIds[
                    activeSupplierIds.length - 1
                ];
                activeSupplierIds.pop();
                break;
            }
        }
    }

    // Function to get user bank details
    function getUserBankDetails(
        uint256 _user
    ) external view returns (Bank memory) {
        return userBankDetails[_user];
    }

    // Function to add user bank details
    function addUserBankDetails(
        string memory _bankName,
        uint256 _bankAccountNumber,
        uint256 _backupAmount
    ) external {
        require(bytes(_bankName).length > 0, "Bank name cannot be empty");
        require(_bankAccountNumber != 0, "Bank account number cannot be zero");
        require(_backupAmount != 0, "Backup amount cannot be zero");
        require(
            userBankDetails[bankCount].id == 0,
            "Bank details already added"
        );

        bankCount++;
        userBankDetails[bankCount] = Bank(
            bankCount,
            _bankName,
            _bankAccountNumber,
            _backupAmount
        );
        emit BankAdded(bankCount);
    }

    // Function to get user bank details
    function getBankDetails() external view returns (Bank[] memory) {
        Bank[] memory allBank = new Bank[](bankCount);
        for (uint256 i = 1; i <= bankCount; i++) {
            allBank[i - 1] = userBankDetails[i];
        }
        return allBank;
    }

    // Function to view details of a specific product
    function viewBank(
        uint256 _bankId
    )
        external
        view
        returns (string memory bankName, uint256 bankNumber, uint256 bankAmout)
    {
        require(_bankId <= bankCount && _bankId > 0, "Invalid bank ID");
        Bank memory bank = userBankDetails[_bankId];
        return (bank.bankName, bank.bankAccountNumber, bank.bankAccountNumber);
    }

    // Function to update details of a product
    function updateBank(
        uint256 _bankId,
        string memory _newName,
        uint256 _newAccountNumber,
        uint256 _newAmount
    ) external {
        require(_bankId <= bankCount && _bankId > 0, "Invalid bank ID");
        Bank storage bank = userBankDetails[_bankId];
        bank.bankName = _newName;
        bank.bankAccountNumber = _newAccountNumber;
        bank.backupAmount = _newAmount;
        emit BankUpdated(_bankId);
    }

    // Function to delete a product
    function deleteBank(uint256 _bankId) external {
        require(_bankId <= bankCount && _bankId > 0, "Invalid bank ID");
        delete products[_bankId];
        emit BankDeleted(_bankId);
    }

    // Function to add a new product
    function addProduct(
        string memory _productName,
        uint256 _productPrice,
        uint256 _productQty
    ) external {
        productCount++;
        products[productCount] = Product(
            productCount,
            _productName,
            _productPrice,
            _productQty
        );
        activeProductIds.push(productCount);
        emit ProductAdded(productCount);
    }

    // Function to view details of a specific product
    function viewProduct(
        uint256 _productId
    )
        external
        view
        returns (
            string memory productName,
            uint256 productPrice,
            uint256 productQty
        )
    {
        require(
            _productId <= productCount && _productId > 0,
            "Invalid product ID"
        );
        Product memory product = products[_productId];
        return (product.productName, product.productPrice, product.productQty);
    }

    // Function to update details of a product
    function updateProduct(
        uint256 _productId,
        string memory _newName,
        uint256 _newPrice,
        uint256 _newQty
    ) external {
        require(
            _productId <= productCount && _productId > 0,
            "Invalid product ID"
        );
        Product storage product = products[_productId];
        product.productName = _newName;
        product.productPrice = _newPrice;
        product.productQty = _newQty;
        emit ProductUpdated(_productId);
    }

    // Function to delete a product
    function deleteProduct(uint256 _productId) external {
        require(
            _productId <= productCount && _productId > 0,
            "Invalid product ID"
        );
        delete products[_productId];
        emit ProductDeleted(_productId);

        // Remove the product ID from activeProductIds array
        for (uint256 i = 0; i < activeProductIds.length; i++) {
            if (activeProductIds[i] == _productId) {
                activeProductIds[i] = activeProductIds[
                    activeProductIds.length - 1
                ];
                activeProductIds.pop();
                break;
            }
        }
    }

    // Function to view all products
    function viewAllProducts() external view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            allProducts[i - 1] = products[i];
        }
        return allProducts;
    }

    // Function to place an order
    function placeOrder(
        uint256[] memory _productIds,
        uint256[] memory _productQtyOrder
    ) external {
        require(
            _productIds.length == _productQtyOrder.length,
            "Length mismatch"
        );

        OrderDetail[] memory orderDetails = new OrderDetail[](
            _productIds.length
        );
        for (uint256 i = 0; i < _productIds.length; i++) {
            require(
                _productIds[i] <= productCount && _productIds[i] > 0,
                "Invalid product ID"
            );
            orderDetails[i] = OrderDetail(
                _productIds[i],
                _productQtyOrder[i],
                0
            ); // Initialize received quantity as 0
        }

        orderCount++;
        uint256 orderNo = orderCount; // Use sequential order number
        Order storage newOrder = userOrders[msg.sender].push();
        newOrder.orderNo = orderNo;
        newOrder.orderDate = block.timestamp;
        newOrder.orderStatus = "placed";

        for (uint256 i = 0; i < orderDetails.length; i++) {
            newOrder.orderDetails[orderDetails[i].productId] = orderDetails[i];
        }

        emit OrderPlaced(orderNo, msg.sender);
    }

    function compareStrings(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // Function to mark an order as received
    function receiveOrder(uint256 _orderNo) external {
        Order[] storage orders = userOrders[msg.sender];
        bool orderFound = false;
        for (uint256 i = 0; i < orders.length; i++) {
            if (
                orders[i].orderNo == _orderNo &&
                !compareStrings(orders[i].orderStatus, "received")
            ) {
                orders[i].orderStatus = "received";
                for (
                    uint256 productId = 1;
                    productId <= productCount;
                    productId++
                ) {
                    if (orders[i].orderDetails[productId].productId != 0) {
                        orders[i]
                            .orderDetails[productId]
                            .productQtyReceived = orders[i]
                            .orderDetails[productId]
                            .productQtyOrder;
                    }
                }
                orderFound = true;
                break;
            }
        }
        require(orderFound, "Order not found or already received");
    }

    // Function to pay a supplier for a received order
    function paySupplier(uint256 _orderNo) external {
        Order[] storage orders = userOrders[msg.sender];
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].orderNo == _orderNo) {
                if (compareStrings(orders[i].orderStatus, "received")) {
                    uint256 totalAmount = orders[i].orderTotalAmount;
                    Bank storage userBank = userBankDetails[0];
                    require(
                        userBank.backupAmount + userBank.bankAccountNumber >=
                            totalAmount,
                        "Insufficient balance"
                    );

                    // Logic to transfer funds to supplier's account
                    // Assuming funds transfer logic is implemented elsewhere

                    // Updating user's bank balance
                    userBank.backupAmount -= totalAmount;
                    emit PaymentSent(_orderNo, msg.sender, totalAmount);
                    break;
                }
            }
        }
    }
}
