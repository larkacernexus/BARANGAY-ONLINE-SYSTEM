<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;

class ClearanceController extends Controller
{
    protected $indexController;
    protected $createController;
    protected $storeController;
    protected $showController;
    protected $editController;
    protected $updateController;
    protected $statusController;
    protected $bulkController;
    protected $notificationController;
    protected $documentController;
    protected $paymentController;

    public function __construct(
        ClearanceIndexController $indexController,
        ClearanceCreateController $createController,
        ClearanceStoreController $storeController,
        ClearanceShowController $showController,
        ClearanceEditController $editController,
        ClearanceUpdateController $updateController,
        ClearanceStatusController $statusController,
        ClearanceBulkController $bulkController,
        ClearanceNotificationController $notificationController,
        ClearanceDocumentController $documentController,
        ClearancePaymentController $paymentController
    ) {
        $this->indexController = $indexController;
        $this->createController = $createController;
        $this->storeController = $storeController;
        $this->showController = $showController;
        $this->editController = $editController;
        $this->updateController = $updateController;
        $this->statusController = $statusController;
        $this->bulkController = $bulkController;
        $this->notificationController = $notificationController;
        $this->documentController = $documentController;
        $this->paymentController = $paymentController;
    }

    public function index(Request $request)
    {
        return $this->indexController->__invoke($request);
    }

    public function create()
    {
        return $this->createController->__invoke();
    }

    public function store(Request $request)
    {
        return $this->storeController->__invoke($request);
    }

    public function show(ClearanceRequest $clearance)
    {
        return $this->showController->__invoke($clearance);
    }

    public function edit(ClearanceRequest $clearance)
    {
        return $this->editController->__invoke($clearance);
    }

    public function update(Request $request, ClearanceRequest $clearance)
    {
        return $this->updateController->__invoke($request, $clearance);
    }

    // Status methods
    public function process(ClearanceRequest $clearance)
    {
        return $this->statusController->process($clearance);
    }

    public function approve(ClearanceRequest $clearance)
    {
        return $this->statusController->approve($clearance);
    }

    public function issue(ClearanceRequest $clearance)
    {
        return $this->statusController->issue($clearance);
    }

    public function reject(Request $request, ClearanceRequest $clearance)
    {
        return $this->statusController->reject($request, $clearance);
    }

    public function cancel(Request $request, ClearanceRequest $clearance)
    {
        return $this->statusController->cancel($request, $clearance);
    }

    // Bulk operations
    public function bulkProcess(Request $request)
    {
        return $this->bulkController->process($request);
    }

    public function bulkApprove(Request $request)
    {
        return $this->bulkController->approve($request);
    }

    public function bulkIssue(Request $request)
    {
        return $this->bulkController->issue($request);
    }

    public function bulkUpdateStatus(Request $request)
    {
        return $this->bulkController->updateStatus($request);
    }

    public function bulkDelete(Request $request)
    {
        return $this->bulkController->delete($request);
    }

    // Document methods
    public function verifyAllDocuments(ClearanceRequest $clearance)
    {
        return $this->documentController->verifyAll($clearance);
    }

    public function requestMoreDocuments(Request $request, ClearanceRequest $clearance)
    {
        return $this->documentController->requestMore($request, $clearance);
    }

    // Payment methods
    public function requestPayment(ClearanceRequest $clearance)
    {
        return $this->paymentController->requestPayment($clearance);
    }

    public function verifyPayment(ClearanceRequest $clearance)
    {
        return $this->paymentController->verifyPayment($clearance);
    }

    public function sendPaymentReminder(ClearanceRequest $clearance)
    {
        return $this->paymentController->sendReminder($clearance);
    }

    // Print methods
    public function print(ClearanceRequest $clearance)
    {
        return $this->showController->print($clearance);
    }

    public function download(ClearanceRequest $clearance)
    {
        return $this->showController->download($clearance);
    }

    // Delete
    public function destroy(ClearanceRequest $clearance)
    {
        return $this->statusController->destroy($clearance);
    }
}   