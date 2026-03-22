<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::table('puroks', function (Blueprint $table) {
        $table->decimal('latitude', 10, 7)->nullable()->after('google_maps_url');
        $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
    });
}

public function down()
{
    Schema::table('puroks', function (Blueprint $table) {
        $table->dropColumn(['latitude', 'longitude']);
    });
}
};
