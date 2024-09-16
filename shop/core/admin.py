from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(Product)
admin.site.register(Transaction)
admin.site.register(AdminToken)

class BankDetailsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # Return False if an instance of BankDetails already exists
        if BankDetails.objects.exists():
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        # Disable delete option
        return False

# Register the admin class with the BankDetails model
admin.site.register(BankDetails, BankDetailsAdmin)
